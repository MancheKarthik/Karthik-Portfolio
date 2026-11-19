"use client"

import { useEffect, useState } from "react"
import { Github, Linkedin, Mail, Phone } from "lucide-react"
import { TIME_ZONE, socials } from "@/data/portfolio"

export const socialLinks = [
  { href: socials.linkedin, label: "LinkedIn", Icon: Linkedin },
  { href: socials.github, label: "GitHub", Icon: Github },
  { href: socials.email, label: "Email", Icon: Mail },
  { href: socials.phone, label: "Phone", Icon: Phone },
].filter((l) => Boolean(l.href))

export const isExternal = (href: string) => href.startsWith("http")

export function LocalTime() {
  const [time, setTime] = useState<string | null>(null)
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", {
      timeZone: TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    const tick = () => setTime(fmt.format(new Date()))
    tick()
    const id = setInterval(tick, 15_000)
    return () => clearInterval(id)
  }, [])
  return <span className="tabular-nums">{time ?? "--:--"}</span>
}

type VisitorPlace = { city: string; timeZone: string }

const PLACE_KEY = "visitor-place"

function cityFromTimeZone(timeZone: string) {
  return timeZone.split("/").pop()?.replace(/_/g, " ") ?? ""
}

function usableZone(timeZone: string | undefined, fallback: string) {
  if (!timeZone) return fallback
  try {
    Intl.DateTimeFormat(undefined, { timeZone })
    return timeZone
  } catch {
    return fallback
  }
}

async function lookupVisitorPlace(signal: AbortSignal, fallbackZone: string): Promise<VisitorPlace> {
  const fromZone = (): VisitorPlace => ({ city: cityFromTimeZone(fallbackZone), timeZone: fallbackZone })

  try {
    const res = await fetch("https://get.geojs.io/v1/ip/geo.json", { signal })
    if (res.ok) {
      const data = (await res.json()) as { city?: string; timezone?: string }
      if (data.city) return { city: data.city, timeZone: usableZone(data.timezone, fallbackZone) }
    }
  } catch (error) {
    if (signal.aborted) throw error
  }

  try {
    const res = await fetch("https://ipwho.is/", { signal })
    if (res.ok) {
      const data = (await res.json()) as { success?: boolean; city?: string; timezone?: { id?: string } }
      if (data.success && data.city) {
        return { city: data.city, timeZone: usableZone(data.timezone?.id, fallbackZone) }
      }
    }
  } catch (error) {
    if (signal.aborted) throw error
  }

  return fromZone()
}

export function VisitorClock() {
  const [time, setTime] = useState("--:--")
  const [city, setCity] = useState("")

  useEffect(() => {
    const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone || TIME_ZONE
    let zone = browserZone
    let fmt = new Intl.DateTimeFormat(undefined, {
      timeZone: zone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    const tick = () => setTime(fmt.format(new Date()))
    tick()
    const id = setInterval(tick, 15_000)

    const apply = (place: VisitorPlace) => {
      setCity(place.city)
      if (place.timeZone === zone) return
      zone = place.timeZone
      fmt = new Intl.DateTimeFormat(undefined, {
        timeZone: zone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      tick()
    }

    let cached: VisitorPlace | null = null
    try {
      const raw = sessionStorage.getItem(PLACE_KEY)
      if (raw) cached = JSON.parse(raw) as VisitorPlace
    } catch {
      cached = null
    }
    if (cached?.city) apply({ ...cached, timeZone: usableZone(cached.timeZone, browserZone) })

    const controller = new AbortController()
    lookupVisitorPlace(controller.signal, browserZone)
      .then((place) => {
        apply(place)
        try {
          sessionStorage.setItem(PLACE_KEY, JSON.stringify(place))
        } catch {
          /* private mode can block storage */
        }
      })
      .catch(() => {})

    return () => {
      clearInterval(id)
      controller.abort()
    }
  }, [])

  return (
    <>
      {city ? <>{city} </> : null}
      <span className="tabular-nums">{time}</span>
    </>
  )
}
