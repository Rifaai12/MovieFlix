import React from 'react'
import Lottie from 'lottie-react'
import starAnimation from '../assets/star.json'
import { FaStar } from 'react-icons/fa'

const MovieCard = ({movie , onClick , rank}) => {
  return (
    
    <div className='relative bg-gray-900 rounded-xl p-3 md:p-4 w-40 sm:w-48 md:w-64 hover:scale-105 md:hover:scale-110 transition duration-300 ' >
      <div className='absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold'>
        🔥 Popularity Score: {movie.popularity.toFixed(1)}
      </div>
      <div onClick={onClick}>
        {
          movie.poster_path ? (
              <img src = {`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className='rounded-lg w-full h-[220px] sm:h-[280px] md:h-[350px] object-cover'
              />
          ) : (
            <div className='rounded-lg w-full h-[350px] bg-gray-700 flex items-center justify-center'>
             <p className='text-white text-center justify-center font-semibold'> poster not available </p>
            </div>

          )
        }
        </div>
        <h2 key={movie.id} className='text-white text-sm md:text-base font-bold mt-3 line-clamp-2'>{movie.title}</h2>
        
      <div className='flex items-center gap-1 md:gap-2 mt-2'>
        <FaStar className='text-yellow-400 text-sm'/>
        <p className='text-white text:xs md:text-base'>
            {movie.vote_average.toFixed(1)}
            <span className='text-gray-600 gap-2 p-1'>|</span>
            <span className='text-white'>{movie.original_language.toUpperCase()}</span>
            <span className='text-gray-600 gap-2 p-1'>|</span>
            <span>{movie.release_date.split("-")[0]}</span>
        </p>
       </div> 
    </div>
    
  )
}

export default MovieCard