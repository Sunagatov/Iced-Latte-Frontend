import { useEffect, useState } from 'react'

type CountdownTimerOptions = {
  durationInMinutes: number
  onTick: (formattedTime: string) => void
  onFinish: () => void
}

export const useCountdownTimer = ({
  durationInMinutes,
  onTick,
  onFinish,
}: CountdownTimerOptions) => {
  const durationInSeconds = durationInMinutes * 60
  const [secondsRemaining, setSecondsRemaining] = useState(durationInSeconds)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = Math.max(0, prev - 1)

        const minutes = Math.floor(next / 60)
        const seconds = next % 60

        const formattedTime = `${String(minutes).padStart(2, '0')}:${String(
          seconds,
        ).padStart(2, '0')}`

        onTick(formattedTime)

        if (next === 0) {
          onFinish()
        }

        return next
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [durationInSeconds, onTick, onFinish])

  return secondsRemaining
}

export const useFormattedTime = (durationInMinutes: number) => {
  const [formattedTime, setFormattedTime] = useState('')

  useCountdownTimer({
    durationInMinutes,
    onTick: (formatted) => {
      setFormattedTime(formatted)
    },
    onFinish: () => {
      // Additional actions to end the timer, if necessary
    },
  })

  return formattedTime
}
