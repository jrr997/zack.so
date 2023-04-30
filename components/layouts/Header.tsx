'use client'

import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { usePathname } from 'next/navigation'
import React from 'react'

import { ThemeSwitcher } from '~/app/ThemeSwitcher'
import { Avatar } from '~/components/Avatar'
import { NavigationBar } from '~/components/layouts/NavigationBar'
import { Container } from '~/components/ui/Container'
import { clamp } from '~/lib/math'

export function Header() {
  const isHomePage = usePathname() === '/'

  const headerRef = React.useRef<HTMLDivElement>(null)
  const avatarRef = React.useRef<HTMLDivElement>(null)
  const isInitial = React.useRef(true)

  const avatarX = useMotionValue(0)
  const avatarScale = useMotionValue(1)
  const avatarBorderX = useMotionValue(0)
  const avatarBorderScale = useMotionValue(1)

  React.useEffect(() => {
    const downDelay = avatarRef.current?.offsetTop ?? 0
    const upDelay = 64

    function setProperty(property: string, value: string | null) {
      document.documentElement.style.setProperty(property, value)
    }

    function removeProperty(property: string) {
      document.documentElement.style.removeProperty(property)
    }

    function updateHeaderStyles() {
      if (!headerRef.current) {
        return
      }

      const { top, height } = headerRef.current.getBoundingClientRect()
      const scrollY = clamp(
        window.scrollY,
        0,
        document.body.scrollHeight - window.innerHeight
      )

      setProperty('--content-offset', `${downDelay}px`)

      if (isInitial.current || scrollY < downDelay) {
        setProperty('--header-height', `${downDelay + height}px`)
        setProperty('--header-mb', `${-downDelay}px`)
      } else if (top + height < -upDelay) {
        const offset = Math.max(height, scrollY - upDelay)
        setProperty('--header-height', `${offset}px`)
        setProperty('--header-mb', `${height - offset}px`)
      } else if (top === 0) {
        setProperty('--header-height', `${scrollY + height}px`)
        setProperty('--header-mb', `${-scrollY}px`)
      }

      if (top === 0 && scrollY > 0 && scrollY >= downDelay) {
        removeProperty('--header-top')
        removeProperty('--avatar-top')
      } else {
        setProperty('--header-top', '0px')
        setProperty('--avatar-top', '0px')
      }
    }

    function updateAvatarStyles() {
      if (!isHomePage) {
        return
      }

      const fromScale = 1
      const toScale = 36 / 64
      const fromX = 0
      const toX = 2 / 16

      const scrollY = downDelay - window.scrollY

      let scale = (scrollY * (fromScale - toScale)) / downDelay + toScale
      scale = clamp(scale, fromScale, toScale)

      let x = (scrollY * (fromX - toX)) / downDelay + toX
      x = clamp(x, fromX, toX)

      avatarX.set(x)
      avatarScale.set(scale)

      const borderScale = 1 / (toScale / scale)

      avatarBorderX.set((-toX + x) * borderScale)
      avatarBorderScale.set(borderScale)

      setProperty('--avatar-border-opacity', scale === toScale ? '1' : '0')
    }

    function updateStyles() {
      updateHeaderStyles()
      updateAvatarStyles()
      isInitial.current = false
    }

    updateStyles()
    window.addEventListener('scroll', updateStyles, { passive: true })
    window.addEventListener('resize', updateStyles)

    return () => {
      window.removeEventListener('scroll', updateStyles)
      window.removeEventListener('resize', updateStyles)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHomePage])

  const avatarTransform = useMotionTemplate`translate3d(${avatarX}rem, 0, 0) scale(${avatarScale})`
  const avatarBorderTransform = useMotionTemplate`translate3d(${avatarBorderX}rem, 0, 0) scale(${avatarBorderScale})`

  const [isShowingAltAvatar, setIsShowingAltAvatar] = React.useState(false)
  const onAvatarContextMenu = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsShowingAltAvatar((prev) => !prev)
    },
    []
  )

  return (
    <>
      <header className="pointer-events-none relative z-50 mb-[--header-mb] flex h-[--header-height] flex-col">
        {isHomePage && (
          <>
            <div
              ref={avatarRef}
              className="order-last mt-[calc(theme(spacing.16)-theme(spacing.3))]"
            />
            <Container className="sticky top-0 order-last -mb-3 pt-3">
              <div className="static top-[var(--avatar-top,theme(spacing.3))] w-full">
                <motion.div
                  className="relative inline-flex"
                  layoutId="avatar"
                  onContextMenu={onAvatarContextMenu}
                >
                  <motion.div
                    className="absolute left-0 top-3 origin-left opacity-[var(--avatar-border-opacity,0)] transition-opacity"
                    style={{
                      transform: avatarBorderTransform,
                    }}
                  >
                    <Avatar />
                  </motion.div>

                  <motion.div
                    className="block h-16 w-16 origin-left"
                    style={{
                      transform: avatarTransform,
                    }}
                  >
                    <motion.div
                      key={isShowingAltAvatar ? 'alt' : 'default'}
                      initial={{ opacity: 0, rotateY: 90 }}
                      animate={{
                        opacity: 1,
                        rotateY: isShowingAltAvatar ? 180 : 0,
                      }}
                      exit={{ opacity: 0, rotateY: -90 }}
                    >
                      <Avatar.Image
                        large
                        alt={isShowingAltAvatar}
                        className="block h-full w-full"
                      />
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            </Container>
          </>
        )}
        <div ref={headerRef} className="sticky top-0 z-10 h-16 pt-6">
          <Container className="static top-[var(--header-top,theme(spacing.6))] w-full">
            <div className="relative flex gap-4">
              <div className="flex flex-1">
                {!isHomePage && (
                  <motion.div
                    layoutId="avatar"
                    className="inline-flex"
                    onContextMenu={onAvatarContextMenu}
                  >
                    <Avatar>
                      <motion.div
                        key={isShowingAltAvatar ? 'alt' : 'default'}
                        initial={{ opacity: 0, rotateY: 90 }}
                        animate={{
                          opacity: 1,
                          rotateY: isShowingAltAvatar ? 180 : 0,
                        }}
                        exit={{ opacity: 0, rotateY: -90 }}
                      >
                        <Avatar.Image alt={isShowingAltAvatar} />
                      </motion.div>
                    </Avatar>
                  </motion.div>
                )}
              </div>
              <div className="flex flex-1 justify-end md:justify-center">
                <NavigationBar.Mobile className="pointer-events-auto md:hidden" />
                <NavigationBar.Desktop className="pointer-events-auto hidden md:block" />
              </div>
              <div className="flex justify-end md:flex-1">
                <div className="pointer-events-auto">
                  <ThemeSwitcher />
                </div>
              </div>
            </div>
          </Container>
        </div>
      </header>
      {isHomePage && <div className="h-[--content-offset]" />}
    </>
  )
}