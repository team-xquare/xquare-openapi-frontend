"use client";

import { useEffect, useId, useState } from "react";
import { CellStatus } from "@/components/request-status/request-status-style";
import { api } from "@/lib/api";
import { errorMessage, isAbortError } from "@/lib/api-error";
import { fetchTimetable, type TimetableResponse } from "@/lib/timetables-api";
import { useToday } from "@/lib/use-today";
import { EmptyCell, SecondaryButton, VisuallyHidden } from "../notice/page-style";
import {
  TIMETABLE_CLASSES,
  TIMETABLE_DAYS,
  TIMETABLE_DEFAULT_CLASS,
  TIMETABLE_GRADES,
  getTimetablePeriods,
  getTimetableWeeks,
  toWeekTimetable,
} from "../timetable-content";
import {
  Card,
  CardHead,
  CardHeading,
  CardMeta,
  CardTitle,
  CellStack,
  CellSub,
  LessonSubject,
  NoLesson,
  SmallSelect,
  SmallSelectBox,
  TimetableControls,
  TimetableDate,
  TimetableTable,
} from "./page-style";

// 불러온 학급 · 주와 함께 둬서, 고른 값을 바꾼 직후 이전 시간표가 잠깐 보이지 않게 함
interface Loaded {
  key: string;
  timetable: TimetableResponse;
}

interface LoadError {
  key: string;
  message: string;
}

// 컴시간 알리미에서 받아온 학급 시간표. 학년·반·주를 고르면 바로 바뀜
export function TimetableCard() {
  const id = useId();
  const today = useToday();
  const [grade, setGrade] = useState(TIMETABLE_DEFAULT_CLASS.grade);
  const [classNumber, setClassNumber] = useState(
    TIMETABLE_DEFAULT_CLASS.classNumber,
  );
  // 고른 주의 월요일. 고르기 전에는 이번 주
  const [pickedWeek, setPickedWeek] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loadError, setLoadError] = useState<LoadError | null>(null);
  // 바뀌면 시간표를 다시 불러옴 (다시 시도)
  const [reloadKey, setReloadKey] = useState(0);

  // 오늘은 브라우저에서만 알 수 있어서 미리 그릴 때는 고를 주가 없음
  const weeks = today ? getTimetableWeeks(today) : [];
  // 고른 주가 목록에 없으면(날짜가 바뀐 뒤 상태가 남은 경우) 이번 주로 보여줌
  const week =
    weeks.find((item) => item.start === pickedWeek) ?? weeks[1] ?? null;
  const key = week ? `${grade}-${classNumber}-${week.start}` : null;
  const weekStart = week?.start ?? null;

  useEffect(() => {
    // 로그인하지 않았으면 일정 목록이 로그인 화면으로 보냄
    if (!key || !weekStart || !api.auth.isLoggedIn()) return;
    const request = new AbortController();
    // 주 안의 아무 날짜나 보내면 그 주 시간표가 옴
    fetchTimetable({ grade, classNum: classNumber, date: weekStart }, request.signal)
      .then((timetable) => {
        setLoaded({ key, timetable });
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || request.signal.aborted) return;
        setLoadError({
          key,
          message: errorMessage(error, "시간표를 불러오지 못했습니다."),
        });
      });
    return () => request.abort();
  }, [key, grade, classNumber, weekStart, reloadKey]);

  const timetable = loaded?.key === key ? loaded.timetable : null;
  const errorText = loadError?.key === key ? loadError.message : "";
  const periods = getTimetablePeriods(timetable);
  const rows = timetable && week ? toWeekTimetable(timetable, week, periods) : null;

  return (
    <Card aria-labelledby={`${id}-title`}>
      <CardHead>
        <CardHeading>
          <CardTitle id={`${id}-title`}>시간표</CardTitle>
          <CardMeta>컴시간 알리미 · 읽기 전용</CardMeta>
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
              value={week?.start ?? ""}
              disabled={!week}
              onChange={(event) => setPickedWeek(event.target.value)}
            >
              {weeks.map((item) => (
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
              const date = week?.dates[dayIndex];
              const isToday = date !== undefined && date === today;

              return (
                <th key={day} scope="col" data-today={isToday || undefined}>
                  {/* 화면 읽기 프로그램이 요일과 날짜를 붙여 읽지 않도록 사이에 공백을 둠 */}
                  {day}{" "}
                  {date && (
                    <TimetableDate>
                      {date.slice(5)}
                      {isToday && " 오늘"}
                    </TimetableDate>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows ? (
            periods.map(({ period, startsAt }, periodIndex) => (
              <tr key={period}>
                <th scope="row">
                  <CellStack>
                    <span>{period}교시</span>
                    {startsAt && <CellSub>{startsAt}</CellSub>}
                  </CellStack>
                </th>
                {TIMETABLE_DAYS.map((day, dayIndex) => {
                  // 시간표 API는 과목만 줘서 선생님 · 변경 표시는 없음
                  const subject = rows[periodIndex]?.[dayIndex];

                  return (
                    <td key={day}>
                      {subject ? (
                        <LessonSubject>{subject}</LessonSubject>
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
            ))
          ) : (
            <tr>
              <EmptyCell colSpan={TIMETABLE_DAYS.length + 1}>
                {errorText ? (
                  <CellStatus role="alert">
                    {errorText}
                    <SecondaryButton
                      type="button"
                      onClick={() => {
                        setLoadError(null);
                        setReloadKey((value) => value + 1);
                      }}
                    >
                      다시 시도
                    </SecondaryButton>
                  </CellStatus>
                ) : (
                  "시간표를 불러오는 중입니다."
                )}
              </EmptyCell>
            </tr>
          )}
        </tbody>
      </TimetableTable>
    </Card>
  );
}
