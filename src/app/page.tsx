'use client'

import dynamic from 'next/dynamic'

const MessageBottleApp = dynamic(() => import('../components/MessageBottleApp'), {
  ssr: false
})

export default function Home() {
  return <MessageBottleApp />
}