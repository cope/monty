const sleep = ms => new Promise(res => setTimeout(res, ms))

let pad = 3;
let simulations = [];

// Randomly put a car behind one door
// Randomly pick one door
// Randomly open a non-picked, non-car door
// Randomly decide whether to switch or not
// Note Win (W) or Lose (L)

const open = (pick, car) => {
	if (pick !== car) {
		// console.log('not same', pick, car);
		return _.first(_.filter(_.range(1, 4), (n) => n !== pick && n !== car));
	}
	let doors = _.filter(_.range(1, 4), (n) => n !== pick);
	let monty = _.random(0);
	// console.log('same', pick, car, 'doors', doors, monty, 'r =', doors[monty]);

	return doors[monty];
};

let output = document.getElementById('output');
const simulate = (i) => {
	let car = _.random(1, 3);
	let pick = _.random(1, 3);
	let opened = open(pick, car);
	let stayed = _.random(1) === 0;

	let wins = false;
	if (car === pick && stayed === true) wins = true;
	if (car !== pick && stayed === false) wins = true;

	let choice = pick;
	if (!stayed) choice = _.first(_.filter(_.range(1, 4), (n) => n !== opened && n !== car));
	simulations.push({car, pick, opened, stayed, choice, wins});

	let output = document.getElementById('output');
	output.innerHTML = `${i} stay=${stayed ? "yes" : "no"} won=${wins ? "yes" : "no"}`;

	console.log(`${_.padStart(i, pad, ' ')}: car=${car} pick=${pick} opened=${opened} stayed=${stayed} wins=${wins}`);

	// let log = document.getElementById('log');
	// log.innerHTML += `<span class="log">${i}</span>: ` +
	// 	`car=${car} ` +
	// 	`pick=${pick} ` +
	// 	`open=${opened} ` +
	// 	`stay=${stayed ? "yes" : " no"} ` +
	// 	`won=${wins ? "yes" : " no"}` +
	// 	'<br clear="all"/>';
};

const template1 = _.template('<table cellpadding="20">' +
	'<tr>' +
	'<td><%= stayedTable %></td>' +
	'<td><%= switchedTable %></td>' +
	'<td><%= totalTable %></td>' +
	'</tr>' +
	'</table>');

const template2 = _.template('<table cellpadding="5">' +
	'<tr>' +
	'<th></th>' +
	'<th><%= label %></th>' +
	'<th>%</th>' +
	'</tr>' +
	'<tr>' +
	'<th>Win</th>' +
	'<td align="center"><%= wins %></td>' +
	'<td align="center"><%= winsPercentage %></td>' +
	'</tr>' +
	'<tr>' +
	'<th>Lose</th>' +
	'<td align="center"><%= loses %></td>' +
	'<td align="center"><%= losesPercentage %></td>' +
	'</tr>' +
	'<tr>' +
	'<th>Total</th>' +
	'<td align="center"><%= count %></td>' +
	'<td></td>' +
	'</tr>' +
	'</table>');

const percentage = (value, count) => ((value / count) * 100).toFixed(2);

const monty = async () => {
	simulations = [];
	document.getElementById('simulate').disabled = true;

	let output = document.getElementById('output');
	output.innerHTML = '';

	let log = document.getElementById('log');
	log.innerHTML = '';

	let header = document.getElementById('header');
	let delay = document.getElementById('delay').value;
	if (delay < 10) delay = 10;
	let iterations = document.getElementById('iterations').value;
	console.log('monty', iterations, delay);

	pad = _.size(iterations + '');

	header.innerHTML = `Simulating ${iterations} iterations, widh a delay of ${delay}ms.`;

	for (var i = 1; i <= iterations; i++) {
		simulate(i);
		await sleep(delay);
	}

	let summary = {
		total: {wins: 0, loses: 0},
		stayed: {wins: 0, loses: 0},
		switched: {wins: 0, loses: 0}
	};
	let wins = 0;
	let loses = 0;
	_.each(simulations, (sim) => {
		sim.wins ? summary.total.wins++ : summary.total.loses++;
		if (sim.stayed) sim.wins ? summary.stayed.wins++ : summary.stayed.loses++;
		else sim.wins ? summary.switched.wins++ : summary.switched.loses++;
	});

	summary.total.count = summary.total.wins + summary.total.loses;
	summary.stayed.count = summary.stayed.wins + summary.stayed.loses;
	summary.switched.count = summary.switched.wins + summary.switched.loses;

	summary.total.winsPercentage = percentage(summary.total.wins, summary.total.count);
	summary.total.losesPercentage = percentage(summary.total.loses, summary.total.count);

	summary.stayed.winsPercentage = percentage(summary.stayed.wins, summary.stayed.count);
	summary.stayed.losesPercentage = percentage(summary.stayed.loses, summary.stayed.count);

	summary.switched.winsPercentage = percentage(summary.switched.wins, summary.switched.count);
	summary.switched.losesPercentage = percentage(summary.switched.loses, summary.switched.count);

	let stayedTable = template2({...summary.stayed, label: 'Stayed'});
	let switchedTable = template2({...summary.switched, label: 'Switched'});
	let totalTable = template2({...summary.total, label: 'Total'});

	output.innerHTML = template1({stayedTable, switchedTable, totalTable});

	document.getElementById('simulate').disabled = false;
};
