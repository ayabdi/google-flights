import React, { useState, useEffect } from 'react'
import { TextField, MenuItem, Box, InputAdornment, Autocomplete } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import PersonIcon from '@mui/icons-material/Person'
import LocationOnIcon from '@mui/icons-material/LocationOn'

import dayjs from 'dayjs'

export interface Airport {
  name: string
  entityId: string
  skyId: string
}

export interface FormState {
  tripType: string
  passengers: number
  travelClass: string
  from: string
  to: string
  originSkyId?: string
  destinationSkyId?: string
  originEntityId?: string
  destinationEntityId?: string
  departureDate: Date | null
  returnDate: Date | null
}

interface FlightSearchBarProps {
  formState: FormState
  handleChange: (field: string, value: any) => void
}

const FlightSearchBar: React.FC<FlightSearchBarProps> = ({ formState, handleChange }) => {
  const [fromOptions, setFromOptions] = useState<Airport[]>([])
  const [toOptions, setToOptions] = useState<Airport[]>([])

  const fetchAirports = async (query: string, setOptions: React.Dispatch<React.SetStateAction<Airport[]>>) => {
    if (!query.length) return
    try {
      const response = await fetch(
        `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=${encodeURIComponent(query)}&locale=en-US`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com',
            'x-rapidapi-key': import.meta.env.VITE_RAPID_API_KEY
          }
        }
      )
      const data = await response.json()
      if (data.status) {
        setOptions(
          data.data.map((airport: any) => ({
            name: airport.presentation.suggestionTitle,
            entityId: airport.entityId,
            skyId: airport.skyId
          }))
        )
      }
    } catch (error) {
      console.error('Error fetching airports:', error)
    }
  }
  // Function to debounce the fetching of airports based on user input
  const debounceFetch = (query: string, setOptions: React.Dispatch<React.SetStateAction<Airport[]>>) => {
    const handler = setTimeout(() => {
      fetchAirports(query, setOptions)
    }, 300)
    return () => clearTimeout(handler)
  }

  useEffect(() => {
    return debounceFetch(formState.from, setFromOptions)
  }, [formState.from])

  useEffect(() => {
    return debounceFetch(formState.to, setToOptions)
  }, [formState.to])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          select
          value={formState.tripType}
          onChange={e => handleChange('tripType', e.target.value)}
          sx={{
            padding: 0,
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '& .MuiSelect-select': {
              padding: 0
            }
          }}
          slotProps={{
            input: {
              sx: { padding: 0 },
              startAdornment: (
                <InputAdornment position="start">
                  {formState.tripType === 'round-trip' ? <SwapHorizIcon /> : <ArrowForwardIcon />}
                </InputAdornment>
              )
            }
          }}
        >
          <MenuItem value="round-trip">Round trip</MenuItem>
          <MenuItem value="one-way">One way</MenuItem>
        </TextField>

        <TextField
          select
          value={formState.passengers}
          onChange={e => handleChange('passengers', Number(e.target.value))}
          sx={{
            minWidth: 80,
            padding: 0,
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '& .MuiSelect-select': {
              padding: 0
            }
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              )
            }
          }}
        >
          {[1, 2, 3, 4].map(num => (
            <MenuItem key={num} value={num}>
              {num}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          value={formState.travelClass}
          onChange={e => handleChange('travelClass', e.target.value)}
          sx={{
            minWidth: 120,
            fontSize: 14,
            padding: 0,
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '& .MuiSelect-select': {
              padding: 0
            }
          }}
        >
          <MenuItem value="economy">Economy</MenuItem>
          <MenuItem value="business">Business</MenuItem>
          <MenuItem value="first">First</MenuItem>
        </TextField>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Autocomplete
          freeSolo
          options={fromOptions}
          sx={{ flex: 1.5 }}
          getOptionLabel={option => option.name}
          inputValue={formState.from}
          onInputChange={(_, newInputValue) => {
            handleChange('from', newInputValue)
          }}
          onChange={(_, newValue) => {
            console.log(newValue)
            handleChange('originSkyId', newValue?.skyId)
            handleChange('originEntityId', newValue?.entityId)
          }}
          onClose={() => {
            if (!fromOptions.map(d => d.name).includes(formState.from)) {
              handleChange('from', '')
              setFromOptions([])
            }
          }}
          renderInput={params => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Where From?"
              slotProps={{
                input: {
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box sx={{ height: 16, width: 16, borderRadius: '50%', border: '3px solid', marginLeft: 0.5 }}></Box>
                    </InputAdornment>
                  ),
                  endAdornment: <>{params.InputProps.endAdornment}</>
                }
              }}
            />
          )}
        />
        <Autocomplete
          freeSolo
          options={toOptions}
          sx={{ flex: 1.5 }}
          inputValue={formState.to}
          getOptionLabel={option => option.name}
          onInputChange={(_, newInputValue) => {
            handleChange('to', newInputValue)
          }}
          onChange={(_, newValue) => {
            handleChange('destinationEntityId', newValue?.entityId)
            handleChange('destinationSkyId', newValue?.skyId)
          }}
          onClose={() => {
            if (!toOptions.map(d => d.name).includes(formState.to)) {
              handleChange('to', '')
              setToOptions([])
            }
          }}
          renderInput={params => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Where to?"
              slotProps={{
                input: {
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon sx={{ marginLeft: 0.5 }} />
                    </InputAdornment>
                  ),
                  endAdornment: <>{params.InputProps.endAdornment}</>
                }
              }}
            />
          )}
        />
        <DatePicker
          label="Departure"
          value={formState.departureDate ? dayjs(formState.departureDate) : null}
          onChange={newValue => handleChange('departureDate', newValue ? dayjs(newValue).toDate() : null)}
          sx={{ flex: 1 }}
          slotProps={{
            textField: { variant: 'outlined' }
          }}
        />
        {formState.tripType === 'round-trip' && (
          <DatePicker
            label="Return"
            value={formState.returnDate ? dayjs(formState.returnDate) : null}
            onChange={newValue => handleChange('returnDate', newValue ? dayjs(newValue).toDate() : null)}
            sx={{ flex: 1 }}
            slotProps={{
              textField: { variant: 'outlined' }
            }}
          />
        )}
      </Box>
    </Box>
  )
}

export default FlightSearchBar
