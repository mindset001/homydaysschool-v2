declare type DaysOfWeek = string[];

declare type Subjects = (string | null)[];

declare interface ClassPeriod {
  [period: string]: Subjects;
}

declare interface ClassTermTimetable {
  [term: string]: ClassPeriod[];
}

declare interface ClassTimetable {
  [studentClass: string]: ClassTermTimetable[];
}
