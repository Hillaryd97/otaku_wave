import React from 'react'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-primary flex flex-col justify-center items-center px-4">
    <div className="text-white lg:text-4xl text-3xl font-bold mb-4">
      Oops! Something went wrong
    </div>
    <p className="text-white text-lg mb-8">
      We couldn't find the page you were looking for.
    </p>
    <a
      href="/"
      className="bg-white text-primary text-lg font-semibold py-2 px-6 rounded hover:bg-opacity-80"
    >
      Go back Home
    </a>
  </div>
  )
}

export default NotFound