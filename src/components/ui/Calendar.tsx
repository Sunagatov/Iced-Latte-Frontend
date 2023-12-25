import Calendar from 'react-calendar'

type ValuePiece = Date | null
type Value = ValuePiece | [ValuePiece, ValuePiece]

interface CalendarComponentProps {
  onChange: (newDate: Value) => void
  isOpen: boolean
  onClickBackdrop: (e: React.MouseEvent<HTMLDivElement>) => void
  selectedDate: Date | null
}

type FormatShortWeekdayFunction = (
  locale: string | undefined,
  date: Date,
) => string

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  onChange,
  isOpen,
  onClickBackdrop,
  selectedDate,
}) => {
  const formatShortWeekday: FormatShortWeekdayFunction = (_, date) => {
    const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

    return daysOfWeek[date.getDay()]
  }

  return (
    <div>
      {isOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 top-0"
          onClick={onClickBackdrop}
        >
          <div className={'calendarContainer'}>
            <Calendar
              className="absolute right-[20%] top-[45%]"
              onChange={onChange}
              value={selectedDate}
              formatShortWeekday={formatShortWeekday}
              minDate={new Date(1940, 0, 1)}
              maxDate={new Date()}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarComponent
