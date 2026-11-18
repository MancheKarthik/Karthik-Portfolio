"use client"

import { useRef } from "react"
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap"
import { INVERT_ICONS, deviconUrl, techIcons } from "@/data/portfolio"

const INVERT = INVERT_ICONS
const FLOATERS = techIcons.slice(0, 18)

export function Background() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(MOTION_OK, () => {
        gsap.utils.toArray<HTMLElement>(".floater").forEach((el) => {
          const newLane = () =>
            gsap.set(el, { left: `${gsap.utils.random(0, 95)}%`, scale: gsap.utils.random(0.6, 1.3) })
          newLane()
          const rise = gsap.fromTo(
            el,
            { y: () => window.innerHeight + 80 },
            {
              y: -120,
              rotation: "random(-180, 180)",
              duration: gsap.utils.random(18, 32),
              ease: "none",
              repeat: -1,
              repeatRefresh: true,
              onRepeat: newLane,
            },
          )
          rise.time(gsap.utils.random(0, rise.duration()))
          gsap.to(el, {
            x: "random(-60, 60)",
            duration: "random(3, 6)",
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            repeatRefresh: true,
          })
        })

        gsap.utils.toArray<HTMLElement>(".orb").forEach((orb) => {
          gsap.to(orb, {
            xPercent: "random(-40, 40)",
            yPercent: "random(-40, 40)",
            duration: "random(8, 14)",
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            repeatRefresh: true,
          })
        })

        const layer = root.current!.querySelector(".orb-layer")
        const toX = gsap.quickTo(layer, "x", { duration: 2, ease: "power2" })
        const toY = gsap.quickTo(layer, "y", { duration: 2, ease: "power2" })
        const onMove = (e: PointerEvent) => {
          toX((e.clientX / window.innerWidth - 0.5) * 80)
          toY((e.clientY / window.innerHeight - 0.5) * 80)
        }
        window.addEventListener("pointermove", onMove)
        return () => window.removeEventListener("pointermove", onMove)
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="bg-scene" aria-hidden="true">
      <div className="orb-layer">
        <div className="orb orb--gold" />
        <div className="orb orb--orange" />
        <div className="orb orb--rose" />
      </div>
      <div className="bg-grid bg-scene__grid" />
      {FLOATERS.map(({ slug, name, variant }) => (
        <img
          key={slug}
          src={deviconUrl(slug, variant)}
          alt=""
          title={name}
          width={36}
          height={36}
          loading="lazy"
          className={`floater ${INVERT.has(slug) ? "invert-dark" : ""}`}
          style={{ transform: "translateY(110vh)" }}
        />
      ))}
    </div>
  )
}
