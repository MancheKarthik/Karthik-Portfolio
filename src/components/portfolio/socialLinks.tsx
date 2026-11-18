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
