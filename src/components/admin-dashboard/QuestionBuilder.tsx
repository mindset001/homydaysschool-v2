import React from "react";

export interface IQuestion {
  type: "objective" | "theory";
  text: string;
  marks: number;
  options: string[];
  correctAnswer: number | null; // index
  sampleAnswer: string;
}

export const emptyQuestion = (): IQuestion => ({
  type: "objective",
  text: "",
  marks: 1,
  options: ["", ""],
  correctAnswer: null,
  sampleAnswer: "",
});

interface Props {
  questions: IQuestion[];
  onChange: (questions: IQuestion[]) => void;
}

const QuestionBuilder: React.FC<Props> = ({ questions, onChange }) => {
  const update = (index: number, patch: Partial<IQuestion>) => {
    const next = questions.map((q, i) => (i === index ? { ...q, ...patch } : q));
    onChange(next);
  };

  const addOption = (qi: number) => {
    const q = questions[qi];
    update(qi, { options: [...q.options, ""] });
  };

  const removeOption = (qi: number, oi: number) => {
    const q = questions[qi];
    const options = q.options.filter((_, i) => i !== oi);
    const correctAnswer =
      q.correctAnswer === oi
        ? null
        : q.correctAnswer !== null && q.correctAnswer > oi
        ? q.correctAnswer - 1
        : q.correctAnswer;
    update(qi, { options, correctAnswer });
  };

  const setOption = (qi: number, oi: number, val: string) => {
    const q = questions[qi];
    const options = q.options.map((o, i) => (i === oi ? val : o));
    update(qi, { options });
  };

  const remove = (index: number) => onChange(questions.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <div key={qi} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Question {qi + 1}
            </span>
            <div className="flex items-center gap-2">
              {/* Type toggle */}
              <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => update(qi, { type: "objective", sampleAnswer: "" })}
                  className={`px-3 py-1.5 transition-colors ${
                    q.type === "objective"
                      ? "bg-[#05878F] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Objective
                </button>
                <button
                  type="button"
                  onClick={() => update(qi, { type: "theory", options: [], correctAnswer: null })}
                  className={`px-3 py-1.5 transition-colors ${
                    q.type === "theory"
                      ? "bg-[#05878F] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Theory
                </button>
              </div>
              {/* Marks */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Marks:</span>
                <input
                  type="number"
                  min="1"
                  value={q.marks}
                  onChange={(e) => update(qi, { marks: Number(e.target.value) || 1 })}
                  className="w-12 border border-gray-200 rounded px-1.5 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#05878F]"
                />
              </div>
              <button
                type="button"
                onClick={() => remove(qi)}
                className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
                title="Remove question"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Question text */}
          <textarea
            value={q.text}
            onChange={(e) => update(qi, { text: e.target.value })}
            rows={2}
            placeholder="Enter question text…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#05878F] mb-3"
          />

          {/* Objective options */}
          {q.type === "objective" && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 mb-1">Options — click the circle to mark correct answer</p>
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => update(qi, { correctAnswer: q.correctAnswer === oi ? null : oi })}
                    className={`w-5 h-5 rounded-full border-2 shrink-0 transition-colors ${
                      q.correctAnswer === oi
                        ? "border-green-500 bg-green-500"
                        : "border-gray-300 hover:border-green-400"
                    }`}
                    title="Mark as correct"
                  />
                  <input
                    value={opt}
                    onChange={(e) => setOption(qi, oi, e.target.value)}
                    placeholder={`Option ${oi + 1}`}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#05878F]"
                  />
                  {q.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(qi, oi)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {q.options.length < 6 && (
                <button
                  type="button"
                  onClick={() => addOption(qi)}
                  className="text-xs text-[#05878F] hover:underline mt-1"
                >
                  + Add option
                </button>
              )}
            </div>
          )}

          {/* Theory sample answer */}
          {q.type === "theory" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Sample / Model Answer <span className="font-normal">(optional — for teacher reference)</span>
              </label>
              <textarea
                value={q.sampleAnswer}
                onChange={(e) => update(qi, { sampleAnswer: e.target.value })}
                rows={2}
                placeholder="Enter model answer…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#05878F]"
              />
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...questions, emptyQuestion()])}
        className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-[#05878F] hover:text-[#05878F] transition-colors"
      >
        + Add Question
      </button>
    </div>
  );
};

export default QuestionBuilder;
