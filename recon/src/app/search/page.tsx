"use client"

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import * as React from "react"

import ElasticResults from '@/features/search/ElasticResults'

export default function Search() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState<string>('')

  useEffect(() => {
    const queryParam = searchParams.get('query')
    setQuery(queryParam ?? '')
  }, [searchParams])

  return <ElasticResults query={query} />
}
