import { Response } from 'express';
import { Student } from '../models/Student.js';
import { Class } from '../models/Class.js';
import { AuthRequest } from '../middleware/auth.js';

/**
 * Ordered promotion chain.
 * Each student in class[N] moves to class[N+1] on promotion.
 * Students in the last class (SS3) are marked as 'Graduated'.
 */
export const PROMOTION_ORDER = [
  'Creche',
  'KG1', 'KG2',
  'Nur1', 'Nur2',
  'Pry1', 'Pry2', 'Pry3', 'Pry4', 'Pry5',
  'JSS1', 'JSS2', 'JSS3',
  'SS1', 'SS2', 'SS3',
];

/**
 * GET /api/students/promotion-preview
 * Returns current student distribution across classes and the promotion mapping.
 */
export const getPromotionPreview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const students = await Student.find({}, 'class userId').populate('userId', 'firstName lastName');

    // Build per-class buckets
    const classBuckets: Record<string, { id: string; name: string }[]> = {};
    for (const s of students) {
      const cls = s.class || 'Unknown';
      if (!classBuckets[cls]) classBuckets[cls] = [];
      const user = s.userId as any;
      classBuckets[cls].push({
        id: s._id.toString(),
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
      });
    }

    const preview = PROMOTION_ORDER.map((cls, idx) => ({
      from: cls,
      to: idx < PROMOTION_ORDER.length - 1 ? PROMOTION_ORDER[idx + 1] : 'Graduated',
      graduating: idx === PROMOTION_ORDER.length - 1,
      studentCount: classBuckets[cls]?.length ?? 0,
      students: classBuckets[cls] ?? [],
    }));

    // Also include any students in classes not in the promotion order
    const unknownClasses = Object.entries(classBuckets)
      .filter(([cls]) => !PROMOTION_ORDER.includes(cls) && cls !== 'Unknown' && cls !== 'Graduated')
      .map(([cls, students]) => ({
        from: cls,
        to: null,
        graduating: false,
        studentCount: students.length,
        students,
      }));

    res.json({ preview, unknownClasses });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Records the promotion/retention decision on the student's academicRecords
 * entry for the given term/year — creating that entry if results haven't
 * been uploaded for the term yet.
 */
const setPromotionStatus = async (
  studentId: any,
  term: string,
  year: number,
  status: 'promoted' | 'repeated',
  promotedToClass: string
): Promise<void> => {
  const updateResult = await Student.updateOne(
    { _id: studentId, 'academicRecords.term': term, 'academicRecords.year': year },
    { $set: { 'academicRecords.$.promotionStatus': status, 'academicRecords.$.promotedToClass': promotedToClass } }
  );

  if (updateResult.matchedCount === 0) {
    await Student.updateOne(
      { _id: studentId },
      { $push: { academicRecords: { term, year, results: [], promotionStatus: status, promotedToClass } } }
    );
  }
};

/**
 * POST /api/students/promote
 * Body: { studentIds: string[], retainedIds?: string[], term?: string, academicYear?: string }
 *   — studentIds: explicit list of student IDs to promote.
 *   — retainedIds: explicit list of student IDs held back (recorded as 'repeated'
 *     on their current term's academic record, if term/academicYear are provided).
 *   — Students NOT in either list are left untouched.
 *   — SS3 students are moved to class = 'Graduated'.
 */
export const promoteStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentIds, retainedIds, term, academicYear } = req.body as {
      studentIds: string[];
      retainedIds?: string[];
      term?: string;
      academicYear?: string;
    };

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      res.status(400).json({ message: 'studentIds must be a non-empty array.' });
      return;
    }

    const year = academicYear ? parseInt(academicYear) : undefined;

    // Fetch only the students that were explicitly selected
    const students = await Student.find({ _id: { $in: studentIds } }, '_id class');

    // Build a lookup: currentClass → next class
    const nextClassMap = new Map<string, string>();
    PROMOTION_ORDER.forEach((cls, idx) => {
      nextClassMap.set(cls, idx < PROMOTION_ORDER.length - 1 ? PROMOTION_ORDER[idx + 1] : 'Graduated');
    });

    // Group students by (fromClass → toClass)
    const buckets = new Map<string, { to: string; ids: any[] }>();
    for (const s of students) {
      const from = s.class;
      const to = nextClassMap.get(from);
      if (!to) continue; // class not in promotion order — skip

      const key = `${from}__${to}`;
      if (!buckets.has(key)) buckets.set(key, { to, ids: [] });
      buckets.get(key)!.ids.push(s._id);
    }

    const results: { from: string; to: string; promoted: number; retained: number }[] = [];

    for (const [key, { to, ids }] of buckets.entries()) {
      const from = key.split('__')[0];
      const graduating = to === 'Graduated';

      // Update selected students' class
      await Student.updateMany({ _id: { $in: ids } }, { $set: { class: to } });

      // Remove promoted students from old Class.students array
      await Class.updateMany({ name: from }, { $pull: { students: { $in: ids } } });

      // Add to new Class.students array (skip if graduating)
      if (!graduating) {
        await Class.updateMany({ name: to }, { $addToSet: { students: { $each: ids } } });
      }

      // Count retained = total in that class - promoted
      const totalInClass = await Student.countDocuments({ class: from });

      results.push({ from, to, promoted: ids.length, retained: totalInClass });

      // Record the decision on this term's academic record
      if (term && year) {
        await Promise.all(ids.map((id) => setPromotionStatus(id, term, year, 'promoted', to)));
      }
    }

    // Record 'repeated' for students explicitly held back this run
    if (term && year && Array.isArray(retainedIds) && retainedIds.length > 0) {
      const retained = await Student.find({ _id: { $in: retainedIds } }, '_id class');
      await Promise.all(
        retained.map((s) => setPromotionStatus(s._id, term, year, 'repeated', s.class))
      );
    }

    const totalPromoted = results.reduce((sum, r) => sum + r.promoted, 0);

    res.json({
      message: `${totalPromoted} student(s) promoted successfully.`,
      totalPromoted,
      results,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
