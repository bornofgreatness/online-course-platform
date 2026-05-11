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
      .then(setCourses)
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Courses</h1>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <div key={course.id} className="border p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
            <p className="text-gray-600 mb-2">{course.description}</p>
            <p className="text-sm text-gray-500 mb-2">Category: {course.category.name}</p>
            <p className="text-sm text-gray-500 mb-4">Workload: {course.workloadHours} hours</p>
            <Link href={`/courses/${course.id}`} className="text-blue-500 hover:underline">
              View Course
            </Link>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && courses.length > 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No courses match your search criteria.</p>
          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedCategory('')
            }}
            className="mt-4 text-blue-500 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
    </>
  )
}
