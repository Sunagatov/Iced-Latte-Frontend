type ValuePiece = Date | null

type Value = ValuePiece | [ValuePiece, ValuePiece]

export interface CalendarComponentProps {
  onChange: (newDate: Value) => void
  isOpen: boolean
  onClickBackdrop: (
    e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent,
  ) => void
  selectedDate: Date | null
}

export type FormatShortWeekdayFunction = (
  locale: string | undefined,
  date: Date,
) => string
