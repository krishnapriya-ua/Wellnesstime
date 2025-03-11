import axios from 'axios';
import React, {useEffect, useState} from 'react';
import GaugeChart from 'react-gauge-chart';
import '../../assets/styles/charts.css'
const BMIChart = ({bmi}) => {
  

    const categorizeBmi = (bmi) => {
        if (bmi < 18.5) {
            return (bmi / 18.5) * 0.25; // Proportional mapping for underweight
        }
        if (bmi >= 18.5 && bmi < 25) {
            return 0.25 + ((bmi - 18.5) / (25 - 18.5)) * 0.25; // Proportional mapping for healthy weight
        }
        if (bmi >= 25 && bmi < 30) {
            return 0.5 + ((bmi - 25) / (30 - 25)) * 0.25; // Proportional mapping for overweight
        }
        return 0.75 + ((bmi - 30) / 10) * 0.25; // Proportional mapping for obese (assuming max BMI = 40)
    };

    const getBmiMessage = (bmi) => {
      if (bmi === null) return "Enter your details to see your BMI.";
        if (bmi < 18.5) 
            return "Your BMI is underweight. Consider gaining some weight for better health.";
        if (bmi >= 18.5 && bmi < 25) 
            return "Your BMI looks perfect. Keep maintaining a healthy weight!";
        if (bmi >= 25 && bmi < 30) 
            return "Your BMI is a little bad. Consider losing some weight.";
        return "Your BMI is high. It's time to focus on weight loss for your health.";
    };

    const bmiPercent = categorizeBmi(bmi);
    const bmiMessage = getBmiMessage(bmi);

    // Define colors for different BMI categories
    const chartColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']; // Blue, Green, Yellow, Orange

    return (
        <div>
            <h6 style={{
                    width: '80%'
                }}>{bmiMessage}</h6>
            <div
                style={{
                    textAlign: 'center',
                    margin: '20px'
                }}>

                <GaugeChart
                    id="bmi-gauge-chart"
                    className='bmi-guage'
                    nrOfLevels={4}
                    percent={Math.max(0, Math.min(bmiPercent, 1))}
                    arcPadding={0.01}
                    colors={chartColors}
                    textColor="transparent"
                    needleColor="#34568B"
                    needleBaseColor="#8884d8"/>
                 {bmi !== null && <h6>BMI: {bmi.toFixed(1)}</h6>}

                {/* Legend */}
                <div className='guagewritings'>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginRight: '15px'
                        }}>
                        <div
                            style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: '#0088FE',
                                marginRight: '5px'
                            }}></div>
                        <span>Underweight</span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginRight: '15px'
                        }}>
                        <div
                            style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: '#00C49F',
                                marginRight: '5px'
                            }}></div>
                        <span>Healthy weight</span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginRight: '15px'
                        }}>
                        <div
                            style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: '#FFBB28',
                                marginRight: '5px'
                            }}></div>
                        <span>Overweight</span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                        <div
                            style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: '#FF8042',
                                marginRight: '5px'
                            }}></div>
                        <span>Obese</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BMIChart;
