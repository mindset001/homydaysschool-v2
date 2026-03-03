export interface UserInterface {
  id: number;
  firstName: string;
  lastName: string;
  lastLogin: string; // Date or string depending on how you're managing dates
  dateJoined: string; // Date or string depending on how you're managing dates
  role: string; // Adjust if there are more roles
  phoneNumber: string;
  username: string;
  email: string;
  is_active: boolean;
  /** optional profile image URL for header/avatar */
  profileImage?: string;
}

export interface IProfile {
  id?: string | number;
  title?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  gender?: string;
  date_of_birth?: string;
  homeAddress?: string;
  stateOfOrigin?: string;
  homeTown?: string;
  qualification?: string;
  country?: string;
  subject?: string;
  classTeacher?: string;
  age?: string;
  image?: string;
  phone_number?: string;
  email?: string;
}
export interface IEvent {
  event: string;
  date: string;
}
export interface baseClassInterface {
  id?: number | string;
  total_starterpack?: number;
  total_others?: number;
  name?: string;
  abbreviation?: string;
  school_fee?: number;
  uniform?: number;
  sport_wear?: number;
  school_bus?: number;
  snack?: number;
  science?: number;
  games?: number;
  library_fee?: number;
  extra_activities?: number;
  starterPack?: number;
  teacher?: string;            // ObjectId of assigned teacher
  teacherName?: string;        // human readable name
}

export interface totalPercentageValueI {
  completed: number;
  incomplete: number;
  void: number;
  total_students: number;
  paid: number;
  paid_half: number;
  paid_nothing: number;
  starter_pack_collected: number;
}

export interface userGuardWardDataI {
  /** optional guardian profile image or avatar URL */
  image?: string;
  /** list of wards returned by the API */
  students?: WardData[];
  // additional fields may be added here if the backend is extended
}

interface WardData {
  id: number;
  // API sometimes returns snake_case or camelCase depending on endpoint/version
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  student_class?: string;
  student_class_id?: number;
  studentClass?: string;
  studentClassId?: number;
}

export interface guardianWardInterface {
  id: number;
  student_class: string;
  guardian_email: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  image: string;
  date_of_birth: string;
  gender: string;
  fathers_name: string;
  mothers_name: string;
  fathers_contact: string;
  mothers_contact: string;
  fathers_occupation: string;
  mothers_occupation: string;
  home_address: string;
  state_of_origin: string;
  home_town: string;
  country: string;
  starter_pack_collected: boolean;
  religion: string;
  total_tuition_paid: number;
  schoolclass: number;
  guardian: number;
}
