import React from 'react'
import { VictoryPie } from 'victory'

interface CircularProgressBarFill {
  x: number
}
interface CircularProgressBarProps {
  percent: number
}
const CircularProgressBar = (props: CircularProgressBarProps) => {
  const { percent } = props
  // Calculate the angle corresponding to the percentage value
  const angle = (percent * 360) / 100

  // Define the data for the VictoryPie chart
  const data = [
    { x: 1, y: percent },
    { x: 2, y: 100 - percent },
  ]

  // Define the style for the VictoryPie chart
  const style = {
    data: {
      fill: (datum: CircularProgressBarFill) => (datum.x === 1 ? 'blue' : 'red'),
      stroke: 'blue',
      strokeLinecap: 'round',
    },
  }

  return (
    <VictoryPie
      innerRadius={15}
      style={{
        data: {
          fillOpacity: 0.9,
          fill: (datum) => (datum.datum.x == 1 ? 'blue' : 'transparent'),
          stroke: 'none',
          strokeWidth: 3,
        },
        labels: {
          fontSize: 25,
          fill: '#c43a31',
        },
      }}
      radius={30}
      startAngle={0}
      data={[
        { x: 1, y: percent },
        { x: 2, y: 100 - percent },
      ]}
    />
  )
}

export default CircularProgressBar
