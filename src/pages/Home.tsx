import { useState } from 'react'
import { Container, Paper, Box, Button } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FlightSearchBar, { FormState } from '../components/FlightSearchBar'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const [formState, setFormState] = useState<FormState>({
    tripType: 'round-trip',
    passengers: 1,
    travelClass: 'economy',
    from: '',
    to: '',
    departureDate: null,
    returnDate: null
  })
  const navigate = useNavigate()

  const handleChange = (field: string, value: any) => {
    setFormState(prevState => ({
      ...prevState,
      [field]: value
    }))
  }

  const isFormComplete = () => {
    const {
      tripType,
      passengers,
      travelClass,
      departureDate,
      returnDate,
      originSkyId,
      destinationSkyId
    } = formState
    if (tripType === 'one-way') {
      return tripType && passengers && travelClass && originSkyId && destinationSkyId && departureDate
    }
    return tripType && passengers && travelClass && originSkyId && destinationSkyId && departureDate && returnDate
  }

  const handleSearch = () => {
    const searchParams = new URLSearchParams(
      Object.entries(formState).reduce((acc, [key, value]) => {
        acc[key] = value !== null ? String(value) : ''
        return acc
      }, {} as Record<string, string>)
    )

    navigate({
      pathname: '/flights',
      search: `?${searchParams.toString()}`
    })
  }

  return (
    <Container maxWidth='lg' sx={{ paddingX: 15 }}>
      <Box
        sx={{
          height: 300,
          backgroundImage: 'url(https://www.gstatic.com/travel-frontend/animation/hero/flights_nc_4.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <h1 style={{ marginTop: -55 }}>Flights</h1>
      <Box sx={{ position: 'relative', width: '90%', margin: 'auto' }}>
        <Paper elevation={4} sx={{ padding: 3 }}>
          <FlightSearchBar formState={formState} handleChange={handleChange} />
        </Paper>
        {isFormComplete() && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            sx={{
              position: 'absolute',
              bottom: -20,
              left: '50%',
              transform: 'translateX(-50%)',
              borderRadius: 24,
              textTransform: 'none'
            }}
          >
            Search
          </Button>
        )}
      </Box>
    </Container>
  )
}

export default Home
