import { useEffect, useRef, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface NexaDatePickerProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

const monthsPT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const monthsEN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const weekdaysPT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const weekdaysEN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (value?: string | null) => {
  if (!value) return '';

  const [year, month, day] = value.split('-');

  if (!year || !month || !day) return '';

  return `${day}/${month}/${year}`;
};

const parseDate = (value?: string | null) => {
  if (!value) return new Date();

  const [year, month, day] = value
    .split('-')
    .map(Number);

  return new Date(year, month - 1, day);
};

const NexaDatePicker = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'dd/mm/yyyy',
}: NexaDatePickerProps) => {
  const [open, setOpen] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = parseDate(value);

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    );
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  const selectedDate = value
    ? parseDate(value)
    : null;

  const today = new Date();

  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );

  const lastDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );

  /*
   * JS: Sunday = 0
   * We want Monday = 0
   */
  const startingDay =
    (firstDay.getDay() + 6) % 7;

  const daysInMonth = lastDay.getDate();

  const days: (number | null)[] = [];

  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  const goPreviousMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1
      )
    );
  };

  const goNextMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      )
    );
  };

  const selectDay = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    onChange(formatDate(date));
    setOpen(false);
  };

  const selectToday = () => {
    onChange(formatDate(today));

    setCurrentMonth(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );

    setOpen(false);
  };

  const clearDate = () => {
    onChange(null);
    setOpen(false);
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;

    return (
      selectedDate.getFullYear() ===
        currentMonth.getFullYear() &&
      selectedDate.getMonth() ===
        currentMonth.getMonth() &&
      selectedDate.getDate() === day
    );
  };

  const isToday = (day: number) => {
    return (
      today.getFullYear() ===
        currentMonth.getFullYear() &&
      today.getMonth() ===
        currentMonth.getMonth() &&
      today.getDate() === day
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      {/* INPUT */}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`
          flex
          h-11
          w-full
          items-center
          justify-between
          rounded-md
          border
          border-white/10
          bg-[#0A1328]
          px-3
          text-sm
          transition-all
          duration-150
          hover:border-blue-500/30
          focus:border-blue-500/50
          focus:outline-none
          disabled:cursor-not-allowed
          disabled:opacity-50
        `}
      >
        <span
          className={
            value
              ? 'text-white'
              : 'text-white/30'
          }
        >
          {value
            ? formatDisplayDate(value)
            : placeholder}
        </span>

        <CalendarDays className="h-4 w-4 text-white/40" />
      </button>

      {/* CALENDAR */}

      {open && !disabled && (
        <div
          className="absolute right-0 top-full z-[999] mt-2 w-[310px] overflow-hidden rounded-xl border border-blue-500/20 bg-[#0D1730] p-3 shadow-2xl shadow-black/50"
        >
          {/* HEADER */}

          <div className="mb-3 flex items-center justify-between">

            <button
              type="button"
              onClick={goPreviousMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-blue-500/10 hover:text-blue-400"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="text-sm font-semibold text-white">
              {monthsPT[currentMonth.getMonth()]}{' '}
              {currentMonth.getFullYear()}
            </div>

            <button
              type="button"
              onClick={goNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-blue-500/10 hover:text-blue-400"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

          </div>

          {/* WEEKDAYS */}

          <div className="mb-1 grid grid-cols-7">
            {weekdaysPT.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-[11px] font-medium text-white/30"
              >
                {day}
              </div>
            ))}
          </div>

          {/* DAYS */}

          <div className="grid grid-cols-7 gap-1">

            {days.map((day, index) => {

              if (day === null) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="h-9"
                  />
                );
              }

              const selected =
                isSelected(day);

              const todayDay =
                isToday(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() =>
                    selectDay(day)
                  }
                  className={`
                    relative
                    flex
                    h-9
                    items-center
                    justify-center
                    rounded-lg
                    text-xs
                    transition-all
                    duration-150

                    ${
                      selected
                        ? 'bg-blue-600 font-semibold text-white shadow-md shadow-blue-600/20'
                        : 'text-white/70 hover:bg-blue-500/15 hover:text-white'
                    }

                    ${
                      todayDay && !selected
                        ? 'ring-1 ring-blue-500/50'
                        : ''
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}

          </div>

          {/* FOOTER */}

          <div className="mt-3 flex items-center justify-between border-t border-white/[0.07] pt-3">

            <button
              type="button"
              onClick={clearDate}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-white/40 transition hover:bg-white/5 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              Limpar
            </button>

            <button
              type="button"
              onClick={selectToday}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-blue-400 transition hover:bg-blue-500/10 hover:text-blue-300"
            >
              Hoje
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default NexaDatePicker;