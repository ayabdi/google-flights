import React, { useEffect, useState } from 'react'
import { Container, Box } from '@mui/material'
import FlightSearchBar, { FormState } from './FlightSearchBar'
import { useSearchParams } from 'react-router-dom'
import FlightItineraries from './FlightItenaries'

const FlightsList: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [formState, setFormState] = useState<FormState>({
    tripType: searchParams.get('tripType') || 'round-trip',
    passengers: Number(searchParams.get('passengers')) || 1,
    travelClass: searchParams.get('travelClass') || 'economy',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    originSkyId: searchParams.get('originSkyId') || '',
    destinationSkyId: searchParams.get('destinationSkyId') || '',
    departureDate: searchParams.get('departureDate') ? new Date(searchParams.get('departureDate')!) : null,
    originEntityId: searchParams.get('originEntityId') || '',
    destinationEntityId: searchParams.get('destinationEntityId') || '',
    returnDate: searchParams.get('returnDate') ? new Date(searchParams.get('returnDate')!) : null
  })

  const handleChange = (field: string, value: any) => {
    setFormState(prevState => ({
      ...prevState,
      [field]: value
    }))
  }

  const [flightItineraries, setFlightItineraries] = useState([])

  useEffect(() => {
    const fetchFlightItineraries = async () => {
      if (!formState.originEntityId || !formState.destinationEntityId) {
        console.error('Missing origin or destination entity IDs')
        return
      }
      try {
        const response = await fetch(
          `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchFlights?originSkyId=${
            formState.originSkyId
          }&destinationSkyId=${formState.destinationSkyId}&originEntityId=${formState.originEntityId}&destinationEntityId=${
            formState.destinationEntityId
          }&date=${formState.departureDate?.toISOString().split('T')[0]}${
            formState.returnDate && formState.tripType === 'round-trip' ? `&returnDate=${formState.returnDate?.toISOString().split('T')[0]}` : ''
          }&cabinClass=${formState.travelClass}&adults=${
            formState.passengers
          }&sortBy=best&currency=USD&market=en-US&countryCode=US`,
          {
            method: 'GET',
            headers: {
              'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com',
              'x-rapidapi-key': import.meta.env.VITE_RAPID_API_KEY
            }
          }
        )
        const { data } = await response.json()
        if (!data) return
        setFlightItineraries(data.itineraries || [])
      } catch (error) {
        console.error('Error fetching flight itineraries:', error)
      }
    }

    fetchFlightItineraries()
  }, [
    formState.originEntityId,
    formState.destinationEntityId,
    formState.departureDate,
    formState.returnDate,
    formState.passengers,
    formState.travelClass,
    formState.tripType,
    formState.originEntityId,
    formState.destinationEntityId
  ])

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ position: 'relative', margin: 'auto' }}>
        <FlightSearchBar formState={formState} handleChange={handleChange} />
        <FlightItineraries itineraries={flightItineraries} />
      </Box>
    </Container>
  )
}

export default FlightsList