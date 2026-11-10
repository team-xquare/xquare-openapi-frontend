"use client";

import { useId, useState } from "react";
import { VisuallyHidden } from "../notice/page-style";
import {
  TIMETABLE_CLASSES,
  TIMETABLE_DAYS,
  TIMETABLE_DEFAULT,
  TIMETABLE_GRADES,
  TIMETABLE_PERIODS,
  TIMETABLE_SYNCED_AT,
  TIMETABLE_THIS_WEEK,
  TIMETABLE_TODAY,
  TIMETABLE_WEEKS,
  TIMETABLES,
  toTimetableKey,
} from "../timetable-content";
import {
  Card,
  CardHead,
  CardHeading,
  CardMeta,
  CardTitle,
  CellStack,
  CellSub,
  ChangedBadge,
  LessonSubject,
  NoLesson,
  SmallSelect,
  SmallSelectBox,
  TimetableControls,
  TimetableDate,
  TimetableTable,
} from "./page-style";

// 컴시간 알리미에서 받아온 학급 시간표. 학년·반·주를 고르면 바로 바뀜
export function TimetableCard() {
  const id = useId();
  const [grade, setGrade] = useState(TIMETABLE_DEFAULT.grade);
  const [classNumber, setClassNumber] = useState(TIMETABLE_DEFAULT.classNumber);
  const [weekStart, setWeekStart] = useState(TIMETABLE_DEFAULT.weekStart);

  // 고른 주가 목록에 없으면(기준일이 바뀐 뒤 상태가 남은 경우) 이번 주로 보여줌
  const week =
    TIMETABLE_WEEKS.find((item) => item.start === weekStart) ??
    TIMETABLE_THIS_WEEK;
  const timetable = TIMETABLES[toTimetableKey(grade, classNumber, week.start)];

  return (
    <Card aria-labelledby={`${id}-title`}>
      <CardHead>
        <CardHeading>
          <CardTitle id={`${id}-title`}>시간표</CardTitle>
          <CardMeta>
            컴시간 알리미 · 읽기 전용 · 마지막 동기화 {TIMETABLE_SYNCED_AT}
          </CardMeta>
        </CardHeading>

        <TimetableControls>
          <SmallSelectBox width={104}>
            <SmallSelect
              aria-label="학년"
              value={grade}
              onChange={(event) => setGrade(Number(event.target.value))}
            >
              {TIMETABLE_GRADES.map((item) => (
                <option key={item} value={item}>
                  {item}학년
                </option>
              ))}
            </SmallSelect>
          </SmallSelectBox>
          <SmallSelectBox width={88}>
            <SmallSelect
              aria-label="반"
              value={classNumber}
              onChange={(event) => setClassNumber(Number(event.target.value))}
            >
              {TIMETABLE_CLASSES.map((item) => (
                <option key={item} value={item}>
                  {item}반
                </option>
              ))}
            </SmallSelect>
          </SmallSelectBox>
          <SmallSelectBox width={216}>
            <SmallSelect
              aria-label="주"
              value={week.start}
              onChange={(event) => setWeekStart(event.target.value)}
            >
              {TIMETABLE_WEEKS.map((item) => (
                <option key={item.start} value={item.start}>
                  {item.label}
                </option>
              ))}
            </SmallSelect>
          </SmallSelectBox>
        </TimetableControls>
      </CardHead>

      <TimetableTable aria-labelledby={`${id}-title`}>
        <thead>
          <tr>
            <th scope="col">교시</th>
            {TIMETABLE_DAYS.map((day, dayIndex) => {
              const date = week.dates[dayIndex];
              const isToday = date === TIMETABLE_TODAY;

              return (
                <th key={day} scope="col" data-today={isToday || undefined}>
                  {/* 화면 읽기 프로그램이 요일과 날짜를 붙여 읽지 않도록 사이에 공백을 둠 */}
                  {day}{" "}
                  <TimetableDate>
                    {date.slice(5)}
                    {isToday && " 오늘"}
                  </TimetableDate>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {TIMETABLE_PERIODS.map(({ period, startsAt }, periodIndex) => (
            <tr key={period}>
              <th scope="row">
                <CellStack>
                  <span>{period}교시</span>
                  <CellSub>{startsAt}</CellSub>
                </CellStack>
              </th>
              {TIMETABLE_DAYS.map((day, dayIndex) => {
                const lesson = timetable?.[periodIndex]?.[dayIndex];

                return (
                  <td key={day}>
                    {lesson ? (
                      <CellStack>
                        <LessonSubject data-changed={lesson.changed || undefined}>
                          {lesson.subject}
                          {lesson.changed && <ChangedBadge>변경</ChangedBadge>}
                        </LessonSubject>
                        <CellSub>{lesson.teacher}</CellSub>
                      </CellStack>
                    ) : (
                      <NoLesson>
                        <span aria-hidden="true">—</span>
                        <VisuallyHidden>수업 없음</VisuallyHidden>
                      </NoLesson>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </TimetableTable>
    </Card>
  );
}
