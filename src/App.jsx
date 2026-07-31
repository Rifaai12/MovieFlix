import React , {useState, useEffect , useRef } from 'react'
import hero1 from './assets/hero1.jpg'
import Search from './components/Search'
import searchIcon from './assets/search.svg'
import MovieCard from './components/MovieCard'
import { useDebounce } from 'react-use'
import { getTrndingMovies, updateSearchCount } from './appwrite'

const App = () => {
  const [searchTerm , setSearchTerm] = useState("");
  const [movieList , setMovieList] = useState([]);
  const [trendingMovies , setTrendingMovies] = useState([]);
  const [isLoading , setIsLoading] = useState(true);
  const [errorMessage , setErrorMessage] = useState("");
  const API_BASE_URL = "https://api.themoviedb.org/3";
  const [debouncedSearchTerm,setDebouncedSearchTerm] = useState('');
  const [suggestions , setSuggestions] = useState([]);
  const [showSuggestions , setShowSuggestions] = useState(false);
  const [movieDetails , setMovieDetails] = useState(null);
  const [cast , setCast] = useState([]);
  const [crew , setCrew] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [selectedMovie , setSelectedMovie] = useState(null);
  const searchRef = useRef(null);
 
  
  useDebounce(()=>setDebouncedSearchTerm(searchTerm),500,[searchTerm])
  const API_OPTIONS = {
    method : "Get",
    headers : {
      accept : "application/json",
      Authorization : `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
    },
  };
  console.log("isloading=",isLoading)
  const fetchSuggestions = async(query) => {
    if(query.length < 2){
      setSuggestions([]);
      return ;
    }
    try {
    const endpoint = `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`;
    const response = await fetch(endpoint, API_OPTIONS);
    const data = await response.json();
    setSuggestions(data.results);
    console.log(data.results)
  }

  catch(error){
      console.log(error);
  }
}
  const fetchMovies = async(query = '') => {
    try{
    const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
    :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
    const response = await fetch(endpoint, API_OPTIONS);
    await new Promise((resolve)=>setTimeout(resolve,3000));
    if (!response.ok){
      throw new Error("Failed to fetch Movies..")

    }
    const data = await response.json();
    console.log(data)
    setMovieList(data.results);
    if (query && data.results.length > 0) {
      await updateSearchCount(query, data.results[0]);
    }
    console.log(data.results);
    } catch(error){
      console.log(error)
    } finally{
      setIsLoading(false)
    }
    
  };


const loadTrendingMovies = async () => {
  try {
    const movies = await getTrndingMovies();
    console.log("Movies returned from Appwrite",movies);

    setTrendingMovies(movies || []);
  } catch (error) {
    console.error(`Error fetching movies: ${error}`);
    
  }
}
console.log("Trending Movies: ", trendingMovies);
console.log("Trending length : ", trendingMovies.length);





  useEffect(()=>{
    fetchMovies(debouncedSearchTerm);
  },[debouncedSearchTerm]);
  console.log(movieList);
  console.log(movieList.length);

  useEffect(()=>{
    loadTrendingMovies();
  },[]);

  useEffect(()=>{
    fetchSuggestions(searchTerm)}, [searchTerm]
  );

  const handleKeyDown = (e)=>{
    if(e.key == "Enter"){
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

useEffect(()=>{
  if (!selectedMovie) return;
  const fetchMovieDetails = async()=>{
    try {
      const detailsRes = await fetch(`${API_BASE_URL}/movie/${selectedMovie}`,API_OPTIONS);
      const creditsRes = await fetch(`${API_BASE_URL}/movie/${selectedMovie}/credits`,API_OPTIONS);
      const videosRes = await fetch(`${API_BASE_URL}/movie/${selectedMovie}/videos`, API_OPTIONS);

      const details = await detailsRes.json();
      const credits = await creditsRes.json();
      const videos = await videosRes.json();

      setMovieDetails(details);
      setCast(credits.cast.slice(0,10));

      setCrew(credits.crew.filter((person)=> person.job == "Director" || person.job == "Producer" || person.job == "Writer"));
      const officialTrailer = videos.results.find((video)=> video.site === "YouTube" && video.type === "Trailer" && video.official)|| videos.results.find((video)=> video.site === "YouTube" && video.type === "Trailer") || videos.results.find((video)=> video.site === "YouTube" && video.type === "Teaser")|| videos.results.find((video)=> video.site === "YouTube");
      setTrailer(officialTrailer||null);

    }
    catch(error){
      console.log(error);
    }
  };
  fetchMovieDetails();
  console.log(selectedMovie);

},[selectedMovie]);

useEffect(()=>{
  const handleClickOutside = (event) => {
    if (
      searchRef.current && !searchRef.current.contains(event.target)
    ){
      setShowSuggestions(false);
    }
  };
  document.addEventListener("mousedown",handleClickOutside);
  return () =>{
    document.removeEventListener("mousedown", handleClickOutside);
  };
},[]);



  return (
    <main 
    style={{
      backgroundImage : `url(${hero1})`,
      backgroundSize : "cover",
      backgroundPosition : "center",
      backgroundRepeat : "no-repeat",
      minHeight : "100vh",
    }}>
    <div className='pattern'/>
    <div className='wrapper'>
       <header>
        
        <h1 className='text-3xl md:text-5xl font-bold text-white text-center'>Find <span className='text-amber-100'>Movies</span> that you can enjoy without hassle.</h1>
        </header>      
      </div>
    <div className='p-5'>
   
      
      <h1 className='text-4xl md:text-6xl font-bold text-red-500 flex justify-center'>
        <span className='text-black'>M</span>ovieFlix
      </h1>
      </div>
      <nav className=' text-1xl flex justify-center p-5'>
      <div ref={searchRef} className=' relative w-full md:w-fit max-w-md '>
      
      <img src={searchIcon} alt = "search" className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5' />
      <input type='text' 
      placeholder='Search movies....'
      value={searchTerm}
      onChange={(e)=> {setSearchTerm(e.target.value);
        setShowSuggestions(true);
      }}
      onKeyDown={handleKeyDown}
      className='bg-white w-full md:w-auto pl-12 pr-6 py-4 rounded-lg'
      />
      {showSuggestions && suggestions.length > 0 && searchTerm.length >= 2 && (
        <div className='absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-lg z-50'>
          {
            suggestions.slice(0,5).map((movie) =>(
              <div key = {movie.id} onClick={()=> {
                setSearchTerm(movie.title);
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              className='px-4 py-2 hover:bg-gray-100 cursor-pointer'>
                  {movie.title}
              </div>
            )
            )
          }
          </div>
      )}
      
      </div>
      </nav>
      <div>
        {trendingMovies.length > 0 && (
          <section className='bg-gray-800 p-5 mt-10'>
            <h2 className='text-white text-2xl md:text-4xl font-bold text-center p-5 md:p-10 '>
              Top Searched movies in MovieFlix...
            </h2>
        
            <ul className='flex justify-center flex-wrap gap-6'>
              {trendingMovies.map((movie,index)=>(
                  <li key={movie.$id} className='w-48 bg-gray-900 rounded-lg p-3'>
                  <p className='text-yellow-400 text-2xl font-bold'>{index + 1}</p>
                  <img src = {movie.poster_url}
                  alt = {movie.title} className='rounded-lg'/>
                  <p className='text-white mt-2 text-center'>
                    {movie.title}
                  </p>
                
                </li>
              ))}

              </ul>
           
            
          </section>
        )}
        <h1 className='text-white text-2xl md:text-3xl text-center mt-5'>
          Top Trending Movies...
        </h1>

        <div className='mt-8 flex flex-wrap justify-center gap-6'>
          {isLoading ?(
          <div className='flex justify-center mt-5'>
            <div className='w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin'></div></div>):
         (movieList.map((movie,index)=>(
            <MovieCard key={movie.id} movie={movie} rank = {index + 1} onClick = {() => setSelectedMovie(movie.id)}/> 
          ))
          )
          
        }
        

        </div>
      </div>
     
      {movieDetails && (
        <div className='fixed inset-0 bg-black/80 flex justify-center items-center z-50'
        onClick={()=> {
          setMovieDetails(null);
          setSelectedMovie(null);
          setCast([]);
          setCrew([]);
          setTrailer(null);
        }}>
          <div className='bg-gray-900 text-white rounded-xl w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto p-8 relative'
          onClick={(e)=>e.stopPropagation()}>
            <button className='absolute top-4 right-5 text-3xl text-red-600 hover:text-red-500'
            onClick={()=>{
              setMovieDetails(null);
              setSelectedMovie(null);
              setCast([]);
              setCrew([]);
              setTrailer(null);
            }}>

            X

            </button>
            
            
          <div className='flex flex-col md:flex-row gap-8'>
            <img src={`https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`} className='w-72 rounded-lg'/>

          <div>
          <h1 className='text-4xl font-bold'>
            {movieDetails.title}
          </h1>
          <p className='mt-4'>{movieDetails.overview}</p>
          <h2 className='text-2xl font-bold mt-8'>Cast</h2>
          <div className='grid grid-cols-2 md:grid-cols-5 gap-5 mt-4'>
            {cast.map((actor)=>(
              <div key = {actor.id}>
                <img src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} className='rounded-lg'/>
                <p>{actor.name}</p>
                <p className='text-gray-400'>{actor.character}</p>
                </div>
                
            ))}
            </div>
            <h2 className='text-2xl font-bold mt-5'>Crew</h2>
            <div>
              {crew.map((person)=>(
                <p key = {person.credit_id}><span className='font-bold'>{person.job}{":"}{person.name}</span></p>
              ))}
            </div>
            
          <p className='mt-4'>⭐{movieDetails.vote_average}</p>
          <p>Release Date : {" "}{movieDetails.release_date}</p>
          <p>Run Time : {" "}{movieDetails.runtime} mins</p>
          <p>Language : {" "}{movieDetails.original_language.toUpperCase()}</p>

          {trailer &&(

           <div className='mt-10'>
              <h2 className='text-2xl font-bold mb-5'>Watch Trailer</h2>
              <iframe
                width = "100%"
                height='500'
                src = {`https://www.youtube.com/embed/${trailer.key}`}
                title='Trailer'
                allowFullScreen>
              </iframe>
              
          </div>)
}
    <div className='flex justify-center items-center'>
               <button className=' text-4xl font-bold text-white mt-4 p-4 px-2.5 cursor-pointer '
            onClick={()=>{
              setMovieDetails(null);
              setSelectedMovie(null);
              setCast([]);
              setCrew([]);
              setTrailer(null);
            }}>

            Go Back

            </button>
            </div>

          

          </div>
          </div>

</div>
          
        </div>
       )}
       
      
      
      </main>
      
    
    
  )
}

export default App
