import React, { useState } from 'react';
import { Grid, TextField as MUITextField, Button as MUIButton, createTheme, ThemeProvider, CircularProgress } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import axios from 'axios';

// Create a Material Design theme
const theme = createTheme({
	palette: {
		primary: {
			main: '#1976d2'
		}
	}
});

// Create a styles object to customize the MUI components
const Root = styled('div')({
	width: 1000,
	margin: '0 auto',
	textAlign: 'center',
	whiteSpace: 'pre-wrap',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	height: "100vh",
});


const GridContainer = styled(Grid)({
	margin: '1rem 0 1rem 1rem'
});

const TextField = styled(MUITextField)({
	margin: '1rem 0 1rem 1rem'
});

const Button = styled(MUIButton)({
	margin: '1rem 0 1rem 1rem'
});

const Itinerary = ({ response, duration }) => {
	// Split the response string into an array of lines
	const lines = response.split("\n");
  
	// Iterate over the array of lines and bold the first word of each line
	const boldedLines = lines.map(line => {
	  	const lineSplit = line.trim().split(/:(.*)/s);

		if(lineSplit.length >= 2 && lineSplit[0].search("Day") === 0){
			const day = lineSplit[0].split(" ")[1];
			const daySplit = day.split("-");
			const lastDay = daySplit.length === 1 ? Number(daySplit[0]) : Number(daySplit[1]);

			if(lastDay && lastDay <= duration){
				return (
					<React.Fragment>
						<strong>{lineSplit[0] + ":"}</strong>
						{lineSplit[1] + "\n"}
					</React.Fragment>
				)
			}
		}
		return (
			<React.Fragment/>
		)
	});
  
	return <p>{boldedLines}</p>;
  }


function App() {
	// State to store the values of the text fields
	const [destination, setDestination] = useState('');
	const [duration, setDuration] = useState('');

	// State to store the response from the API call
	const [response, setResponse] = useState('');

	// State to store whether the API call is in progress
	const [isLoading, setIsLoading] = useState(false);

	// Function to call when the "Submit" button is clicked
	const handleSubmit = () => {
		// Set isLoading to true to disable the button
		setIsLoading(true);

		// Make the API call here, using the destination and duration values
		// Then set the response in state using setResponse
		const prompt = `
			This program will generate a vacation itinerary given the destination and days of stay.
			--
			Destination: Japan
			Days of stay: 15
			Itinerary: 
			Day 1-4 Tokyo: Visit Shibuya, the Imperial Palace, Yoyogi park, the Sensoji temple, Harajuku, Asakusa, and the neighborhood around the Skytree.
			Day 5: Matsumoto: Visit the Samurai castle and explore the small streets.
			Day 6-7 Yudanaka: Go watch the snow monkeys and relax in one of the many local onsens.
			Day 8 Kanazawa: Visit the Kenrokuen garden, Kanazawa Castle, and the old geisha district.
			Day 9 Takayama: Visit the Hida Folk Village and the old town of Takayama.
			Day 10 Ise: Pay a visit to the Ise Shrines
			Day 11-14 Osaka: Explore the Namba district, visit Osaka Castle, walk along the river to the Kema Sakuranomiya Park, visit Shinsekai, attend a cooking class, and see the city from above.
			Day 15 Koyasan: Spend the night in a temple and walk from temple to temple, attend the morning prayer, and visit the cemetery of Koyasan.
			--
			Destination: Japan
			Days of stay: 9
			Itinerary: 
			Day 1-3 Kyoto: Explore Gion, the Inari Shrines, walk the philosopher’s path, visit the Golden Temple, and make a side trip to Arashiyama.
			Day 4 Hiroshima: Visit the peace park and Hiroshima Castle.
			Day 5 Miyajima: Admire the floating Torii gate and the colorful Daisyoin Temple and feed the deer.
			Day 6-7 Nagasaki: Walk along the harbor, the cozy Dejima wharf, and Chinatown. Explore the Dutch history at the old trading post-Dejima and the Dutch Slope. Visit Battleship Island.
			Day 8-9 Tokyo: Visit Akihabara, Tokyo DisneySea.
			--
			Destination: India
			Days of stay: 14
			Itinerary: 
			Day 1 Delhi: Visit Chandni Chowk, Red Fort, the Jama Masjid mosque, the Lotus temple, the Akshardham temple, Humayun’s tomb, and Qutab Minar.
			Day 2-3 Agra: Visit the Taj Mahal at sunrise, the Tomb of Itimad Ud Daulah, and Agra Fort.
			Day 4-5 Ranthambore: Do as many tiger safaris as possible.
			Day 6-7 Jaipur: Visit the city palace, Jantar Mantar observatory, Amer Fort, Panna Meena ka Kund medieval stepwell, Water Palace, Hawa Mahal ( Palace of the wind), and Galwar Bagh ( Monkey Temple ).
			Day 8-9 Kochi: Visit the Chinese Fishing Nets, the Pardesi Synagogue, the St. Francis Church, The Mattancherry Palace, also called the Dutch Palace. 
			Day 10-11 Munar: Visit the tea plantations, the Mattupety Dam, Echo Point, and Top Station. Go hiking.
			Day 12-14 Allepey, Kumarakom, Cochin: Make a cruise on the backwaters, make a Shikara boat tour, relax in a resort in Kumarakom, take an Ayurveda massage.
			--
			Destination: Kerala
			Days of stay: 7
			Itinerary:
			Day 1-2 Kochi: Visit the Chinese Fishing Nets, the Pardesi Synagogue, the St. Francis Church, walk through Princess street, Mattancherry Palace, attend a Kathakali dance show.
			Day 3-4 Munnar: Visit the tea plantations, Mattupety Dam, Echo Point, and Top Station. Go hiking, visit Eravikulam National Park, Chinnar Wildlife Sanctuary.
			Day 5-7 Allepey, Kumarakom, and Cochin: Relax in Allepey, cruise the backwaters, make a Shikara boat ride, take an Ayurveda massage.
			--
			Destination: ${destination}
			Days of stay: ${duration}
			Itinerary:
		`;

		const data = {
			model: "xlarge",
			prompt: prompt,
			max_tokens: 500,
			temperature: 0.7,
			frequency_penalty: 0.2,
			stop_sequences: ["--"]
		}

		const options = {
			method: 'POST',
			url: 'https://api.cohere.ai/generate',
			headers: {
				accept: 'application/json',
				'Cohere-Version': '2021-11-08',
				'content-type': 'application/json',
				authorization: 'Bearer ' + process.env.REACT_APP_COHERE_API_KEY
			},
			data: data
		};

		axios
			.request(options)
			.then(function (response) {
				setResponse(response.data["generations"][0]["text"]);
				setIsLoading(false);
				console.log("Success!");
			})
			.catch(function (error) {
				setIsLoading(false);
				console.error(error);
			});

	};

	return (
		<ThemeProvider theme={theme}>
			<Root>
				<GridContainer container>
					<Grid item xs={12}>
						<TextField
							id="destination"
							label="Destination"
							value={destination}
							onChange={e => setDestination(e.target.value)}
						/>
						<TextField
							id="duration"
							label="Duration (Days)"
							value={duration}
							onChange={e => setDuration(e.target.value)}
						/>
						<Button variant="contained" color="primary" onClick={handleSubmit} disabled={isLoading}>
							{isLoading ? <CircularProgress size={24} /> : 'Submit'}
						</Button>
					</Grid>
					<Grid item xs={12}>
						<Itinerary response={response} duration={duration}/>
					</Grid>
				</GridContainer>
			</Root>
		</ThemeProvider>
	);

}

export default App;
