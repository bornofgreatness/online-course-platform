'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'

interface Course {
  id: string
  title: string
  description: string
  category: { name: string }
  workloadHours: number
  thumbnailUrl?: string | null
  enrollments: Array<{ id: string }>
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(courses => {
        const withEnrollments = courses.map((c: any) => ({
          ...c,
          enrollments: c.enrollments || []
        }))
        setCourses(withEnrollments)
      })
  }, [])

  useEffect(() => {
    const uniqueCategories = Array.from(new Set(courses.map(course => course.category.name)))
    setCategories(uniqueCategories)
  }, [courses])

  useEffect(() => {
    let filtered = courses

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(course => course.category.name === selectedCategory)
    }

    setFilteredCourses(filtered)
  }, [courses, searchTerm, selectedCategory])

  return (
    <>
      <Header />
      <div className="min-h-screen p-8">
        <h1 className="text-3xl font-bold mb-6">Courses</h1>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full rounded-lg px-4 py-3 text-left transition ${selectedCategory === '' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All Categories
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full rounded-lg px-4 py-3 text-left transition ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </aside>

          <section>
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  {selectedCategory ? `${selectedCategory} Courses` : 'All Courses'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
                </p>
              </div>

              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map(course => (
                <div key={course.id} className="flex flex-col rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200 overflow-hidden flex-shrink-0">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 text-4xl">
                        📚
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                    <div className="mb-3 text-xs text-gray-500">
                      {course.category.name}
                    </div>
                    <div className="mb-2 text-xs text-gray-500">
                      {course.workloadHours} hours
                    </div>
                    <div className="mb-4 text-sm font-medium text-blue-600">
                      {course.enrollments.length} student{course.enrollments.length !== 1 ? 's' : ''}
                    </div>
                    <Link href={`/courses/${course.id}`} className="text-blue-600 hover:underline text-sm font-medium mt-auto">
                      View Course →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {filteredCourses.length === 0 && courses.length > 0 && (
              <div className="mt-10 rounded-3xl border border-gray-200 bg-gray-50 p-10 text-center">
                <p className="text-gray-500">No courses found for this category or search.</p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('')
                  }}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Show all courses
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
