
type StepperProps = {
  steps: string[]
  current: number
}

export const Stepper = ({ steps, current }: StepperProps) => {
  return (
    <>
      {/* Mobile progress */}
      <div className="sm:hidden">
        <p className="text-sm font-medium text-foreground">
          Step {current + 1} of {steps.length} · {steps[current]}
        </p>

        <div className="mt-2 h-2 rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-progress"
            style={{
              width: `${((current + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Desktop progress */}
      <ol className="hidden sm:flex">
        {steps.map((label, i) => {
          const done = i < current
          const active = i === current

          return (
            <li
              key={label}
              className="relative flex flex-1 flex-col items-center"
            >
              {i > 0 && (
                <span
                  aria-hidden
                  className={`absolute -left-1/2 top-5 w-full -translate-y-1/2 ${
                    i <= current
                      ? 'h-0.5 bg-progress'
                      : 'border-t-2 border-dashed border-border'
                  }`}
                />
              )}

              <span
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                  done
                    ? 'border-primary bg-primary text-white'
                    : active
                      ? 'border-primary bg-white text-foreground'
                      : 'border-border bg-white text-muted-foreground'
                }`}
              >
                {done ? '✓' : i + 1}
              </span>

              <span
                className={`mt-1 text-sm ${
                  active || done
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
            </li>
          )
        })}
      </ol>
    </>
  )
}
