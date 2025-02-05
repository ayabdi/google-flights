import React, { useState } from 'react'
import { Accordion, Box, AccordionSummary, AccordionDetails, Typography, Divider, Button } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

interface Carrier {
  name: string
  logoUrl: string
}

interface Segment {
  id: string
  departure: string
  arrival: string
  origin: { name: string; displayCode: string }
  destination: { name: string; displayCode: string }
  durationInMinutes: number
  marketingCarrier: { name: string; alternateId: string }
  flightNumber: string
}

interface Leg {
  departure: string
  arrival: string
  durationInMinutes: number
  stopCount: number
  origin: { displayCode: string }
  destination: { displayCode: string }
  carriers: { marketing: Carrier[] }
  segments: Segment[]
  timeDeltaInDays?: number
}

interface Itinerary {
  id: string
  legs: Leg[]
  price: { formatted: string }
  eco?: { ecoContenderDelta?: number }
}

interface FlightItinerariesProps {
  itineraries: Itinerary[]
}

// Helper function to format time
const formatTime = (time: string) => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })

// Helper function to calculate layover time
const calculateLayoverTime = (arrival: string, nextDeparture: string) => {
  const arrivalTime = new Date(arrival).getTime()
  const departureTime = new Date(nextDeparture).getTime()
  const layoverMinutes = (departureTime - arrivalTime) / (1000 * 60)
  const hours = Math.floor(layoverMinutes / 60)
  const minutes = layoverMinutes % 60
  return `${hours} hrs ${minutes} min`
}

const FlightItineraries: React.FC<FlightItinerariesProps> = ({ itineraries }) => {
  const [page, setPage] = useState(0)
  const itemsPerPage = 10

  const paginatedItineraries = itineraries.slice(page * itemsPerPage, (page + 1) * itemsPerPage)

  return (
    <Box sx={{ marginTop: 2 }}>
      {paginatedItineraries.map((itinerary: any) => {
        const firstLeg = itinerary.legs?.[0]
        if (!firstLeg) return null

        return (
          <Accordion key={itinerary.id} sx={{ boxShadow: '0.1px', border: '1px solid', borderColor: 'grey.300' }} elevation={0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel-${itinerary.id}-content`}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: 1 }}>
                {/* Airline Logo & Departure Time */}
                <Box sx={{ display: 'flex', gap: 2, flex: 2.5 }}>
                  <img
                    src={firstLeg.carriers.marketing[0].logoUrl}
                    alt={firstLeg.carriers.marketing[0].name}
                    style={{ height: 35, borderRadius: '50%' }}
                  />
                  <Box>
                    <Typography fontWeight={500}>
                      {formatTime(firstLeg.departure)} - {formatTime(firstLeg.arrival)}
                      {firstLeg.timeDeltaInDays ? <sup>+{firstLeg.timeDeltaInDays}</sup> : ''}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" fontSize={12}>
                      {firstLeg.carriers.marketing[0].name}
                    </Typography>
                  </Box>
                </Box>

                {/* Flight Duration */}
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={400}>
                    {Math.floor(firstLeg.durationInMinutes / 60)} hrs {firstLeg.durationInMinutes % 60} min
                  </Typography>
                  <Typography variant="body2" color="textSecondary" fontSize={12}>
                    {firstLeg.origin.displayCode} - {firstLeg.destination.displayCode}
                  </Typography>
                </Box>

                {/* Stops & Layovers */}
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={400}>
                    {firstLeg.stopCount} {firstLeg.stopCount === 1 ? 'stop' : 'stops'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" fontSize={12}>
                    {firstLeg.segments.length > 1
                      ? firstLeg.segments
                          .slice(0, -1)
                          .map((segment, index) => {
                            const nextSegment = firstLeg.segments[index + 1]
                            return nextSegment
                              ? `${calculateLayoverTime(segment.arrival, nextSegment.departure)} ${
                                  nextSegment.origin.displayCode
                                }`
                              : ''
                          })
                          .join(' · ')
                      : 'Direct flight'}
                  </Typography>
                </Box>

                {/* CO2 Emissions */}
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={400}>
                    {itinerary.eco ? `${itinerary.eco.ecoContenderDelta?.toFixed(0)} kg CO2e` : ''}
                  </Typography>
                </Box>

                {/* Price */}
                <Box sx={{ flex: 1, textAlign: 'right' }}>
                  <Typography fontWeight={500}>{itinerary.price.formatted}</Typography>
                </Box>
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ paddingY: 0, borderTop: '1px solid', borderColor: 'grey.300' }}>
              <Box sx={{ paddingX: 1, paddingY: 2 }}>
                {firstLeg.segments.map((segment, index) => (
                  <Box key={segment.id}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <img
                        src={itinerary.legs[0].carriers.marketing[0].logoUrl}
                        alt={itinerary.legs[0].carriers.marketing[0].name}
                        style={{ height: 35, borderRadius: '50%' }}
                      />

                      <Box sx={{ display: 'flex', gap: 0.5, flexDirection: 'column', alignItems: 'center', marginY: '5px' }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            border: 2,
                            borderColor: 'grey.300'
                          }}
                        />
                        <Box sx={{ height: 40, borderLeft: '4px dotted grey', borderColor: 'grey.300' }} />
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            border: 2,
                            borderColor: 'grey.300'
                          }}
                        />
                      </Box>
                      <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                        <Typography>
                          {formatTime(segment.departure)} · {segment.origin.name} ({segment.origin.displayCode})
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Travel time: {Math.floor(segment.durationInMinutes / 60)} hrs {segment.durationInMinutes % 60} min
                        </Typography>
                        <Typography>
                          {formatTime(segment.arrival)} · {segment.destination.name} ({segment.destination.displayCode})
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            {segment.marketingCarrier.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            ·
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Economy
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            ·
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {segment.marketingCarrier.alternateId} {segment.flightNumber}
                          </Typography>
                        </Box>
                        {index < itinerary.legs[0].segments.length - 1 && (
                          <Box sx={{ marginY: 2, width: '100%' }}>
                            <Divider />
                            <Typography sx={{ paddingY: 2 }}>
                              {calculateLayoverTime(segment.arrival, itinerary.legs[0].segments[index + 1].departure)} layover{' '}
                              {itinerary.legs[0].segments[index + 1].origin.name} (
                              {itinerary.legs[0].segments[index + 1].origin.displayCode})
                            </Typography>
                            <Divider />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        )
      })}
      {/* Pagination */}
      {itineraries.length > itemsPerPage ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 3 }}>
          <Button onClick={() => setPage(prev => Math.max(prev - 1, 0))} disabled={page === 0}>
            Previous
          </Button>
          <Button
            onClick={() => setPage(prev => ((prev + 1) * itemsPerPage < itineraries.length ? prev + 1 : prev))}
            disabled={(page + 1) * itemsPerPage >= itineraries.length}
          >
            Next
          </Button>
        </Box>
      ) : (
        <></>
      )}
    </Box>
  )
}

export default FlightItineraries
