import React, { useState, useEffect } from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import PropTypes from 'prop-types';

import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DatePicker from '@mui/lab/DatePicker';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Checkbox from '@mui/material/Checkbox';
import { styled } from '@mui/material/styles';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';

import Dialog from '@mui/material/Dialog';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';

import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';


import { useParams } from 'react-router-dom';
import moment from 'moment';
import _ from 'lodash';

Highcharts.setOptions({
  lang: {
    decimalPoint: '.',
    thousandsSep: ','
  }
});

const Interval = {
  WEEK: "week",          // 7 days
  MONTH: "month",        // 30 days
  QUARTER: "quarter",    // 91 days
  SEMESTER: "semester",  // 182 days
  YEAR: "year",          // 365 days
  ONCE: "once"
};

const EventType = {
  DEPOSIT: "deposit",                       // Periodic deposit of constant amount
  WITHDRAWAL: "withdrawal",                 // Periodic withdrawal of constant amount
};

SaveShareDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
};

function SaveShareDialog(props) {
  
  const { onClose, open, link } = props;

  const [type, setType] = React.useState(EventType.WITHDRAWAL);
  const [interval, setInterval] = React.useState(Interval.MONTH);
  const [value, setValue] = React.useState(0);
  const [date, setDate] = React.useState(null);

  const handleClose = () => {
    onClose();
  };

  const handleCopy = (e) => {
    navigator.clipboard.writeText(link)
  };

  return (
    <Dialog onClose={handleClose} open={open}
    aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
      <DialogTitle>Save/Share</DialogTitle>
      <DialogContent >
      <DialogContentText style={{overflow: "hidden", textOverflow: "ellipsis", width: '500px'}}>{link}</DialogContentText>
      </DialogContent>
      <DialogActions>
      <Button variant="contained" onClick={handleCopy}>Copy to Clipboard</Button>
      <Button variant="contained" onClick={handleClose}>Dismiss</Button>
      </DialogActions>

    </Dialog>
  );
}

AddEventDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
};

function AddEventDialog(props) {
  
  const { onClose, onSave, open } = props;

  const [type, setType] = React.useState(EventType.WITHDRAWAL);
  const [interval, setInterval] = React.useState(Interval.MONTH);
  const [value, setValue] = React.useState(0);
  const [date, setDate] = React.useState(null);

  const handleClose = () => {
    onClose();
  };

    
  const save = (x) => {
    const newEvent = {
      type: type,
      interval: interval,
      value: value,
      date: date
    };
    console.log(newEvent);
    onSave(newEvent);
  };

  function capitalize(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const handleTypeChange = (event) => { setType(event.target.value); };
  const handleIntervalChange = (event) => { setInterval(event.target.value); };
  const handleValueChange = (event) => { setValue(event.target.value); };
  const handleDateChange = (newValue) => { setDate(newValue); };

  return (
    <Dialog onClose={handleClose} open={open}
    aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
      <DialogTitle>Add New Event</DialogTitle>
      <DialogContent >
      <Grid container spacing={{ xs: 2 }} columns={{ xs: 3 }}>
      <Grid item xs={3}>
      <Select
        value={type}
        label="Type"
        onChange={handleTypeChange}
      >
        <MenuItem value={EventType.WITHDRAWAL}>{capitalize(EventType.WITHDRAWAL)}</MenuItem>
        <MenuItem value={EventType.DEPOSIT}>{capitalize(EventType.DEPOSIT)}</MenuItem>
      </Select>
      </Grid>

      <Grid item xs={3}>
      <Select
        value={interval}
        label="Interval"
        onChange={handleIntervalChange}
      >
        <MenuItem value={Interval.ONCE}>{capitalize(Interval.ONCE)}</MenuItem>
        <MenuItem value={Interval.WEEK}>{capitalize(Interval.WEEK)}</MenuItem>
        <MenuItem value={Interval.MONTH}>{capitalize(Interval.MONTH)}</MenuItem>
        <MenuItem value={Interval.QUARTER}>{capitalize(Interval.QUARTER)}</MenuItem>
        <MenuItem value={Interval.SEMESTER}>{capitalize(Interval.SEMESTER)}</MenuItem>
        <MenuItem value={Interval.SEMESTER}>{capitalize(Interval.YEAR)}</MenuItem>
      </Select>
      </Grid>
      <Grid item xs={3}>
        <TextField label="Amount" type="number" value={value}
          InputLabelProps={{ shrink: true }}
          InputProps={{ endAdornment: <InputAdornment position="end">USD</InputAdornment> }}
          onChange={handleValueChange}/>
      </Grid>
      
      { interval === Interval.ONCE ? <Grid item xs={3}>
      <DatePicker
          label="Date"
          inputFormat="dd/MM/yyyy"
          value={date}
          onChange={handleDateChange}
          renderInput={(params) => <TextField {...params} />}/>
      </Grid> : null }
      
      </Grid>
      </DialogContent>
      <DialogActions>
      <Button variant="contained" onClick={save}>Save</Button>
      </DialogActions>

    </Dialog>
  );
}

function App() {

  /** rate of FWT stake needed to power superchargers */
  const kFWTRequirementRate = 25;

  const kUSDSuperchargerAPY = 43;

  // Base fees for all superchargers
  const kDepositFee = 0.44;
  const kWithdrawalFee = 2.56;

  /** dialog state */
  const [open, setOpen] = useState(false);

  /** dialog state */
  const [saveShareOpen, setSaveShareOpen] = useState(false);

  /** link to be shared in save/share dialog */
  const [saveShareLink, setSaveShareLink] = useState(null);
  
  /** whether to simulate fee redistributions at an arbitrary rate */
  const [startingBalance, setStartingBalance] = useState(1000);

  /** whether to simulate fee redistributions at an arbitrary rate */
  const [startingDeposit, setStartingDeposit] = useState(0);

  /** whether to simulate fee redistributions at an arbitrary rate */
  const [simulateRedistributions, setSimulateRedistributions] = useState(false);

  /** arbitrary rate at which to simulate fee redistributions */
  const [simulatedRedistributionsAPY, setSimulatedRedistributionsAPY] = useState(2);

  /** additional deposit fees depending on the payment method and currency */
  const [additionalDepositFees, setAdditionalDepositFees] = useState(1);

  /** additional withdrawal fees depending on the method and currency */
  const [additionalWithdrawalFees, setAdditionalWithdrawalFees] = useState(1);

  /** date at which the simulation starts */
  const [startDate, setStartDate] = useState(currentDateStartOfDayUTC());

  /** how long the simulation should run for in days*/
  const [simulationDurationDays, setSimulationDurationDays] = useState(365);

  /** conditions and events that rule the simulation */
  const [events, setEvents] = useState([
   // { type: EventType.WITHDRAWAL, interval: Interval.MONTH, value: 3000 },
   // { type: EventType.DEPOSIT, interval: Interval.MONTH, value: 1000 },
   // { type: EventType.WITHDRAWAL, interval: Interval.ONCE, value: 1000, date: new Date(Date.UTC(2021, 9 - 1, 23)) }, 
  ]);

  const params = useParams()

  useEffect(() => {
    try {
      if (params.data) {
        const data = JSON.parse(atob(params.data));
        setEvents(data.events);
        setSimulationDurationDays(data.simulationDurationDays);
        setStartingBalance(data.startingBalance);
        setStartingDeposit(data.startingDeposit);
        setSimulateRedistributions(data.simulateRedistributions);
        setSimulatedRedistributionsAPY(data.simulatedRedistributionsAPY);
        setAdditionalDepositFees(data.additionalDepositFees);
        setAdditionalWithdrawalFees(data.additionalWithdrawalFees);
        setStartDate(new Date(data.startDate));
      }
    }
    catch(e) {
      console.log(e);
    }
  }, [params]);
  
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    calculate();
  }, [events, startDate,simulationDurationDays, additionalDepositFees, additionalWithdrawalFees, simulateRedistributions, simulatedRedistributionsAPY, startingBalance, startingDeposit])

  function currentDateStartOfDayUTC() {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  }

  function formatDateUTC(date) {
    return moment.utc(date).format('yyyy-MM-DD');
  }

  function formatNumber(number, maximumFractionDigits = 0) {
    while (number !== 0 && number < 1 / Math.pow(10, maximumFractionDigits) && maximumFractionDigits < 12) {
      maximumFractionDigits += 4;
    }

    return (number).toLocaleString( [ 'en-US' ], { 
      localeMatcher            : 'lookup',
      style                    : 'decimal',
      maximumFractionDigits    : maximumFractionDigits,
    });
  }

  function shouldTriggerEvent(event, currentDate, startDate) {
    if (event.interval) {
      const lastTriggerTime = event.lastTriggerTime || startDate.getTime();
      const day = 24 * 3600 * 1000;

      let neededElapsedTime = 0;
      switch (event.interval) {
        case Interval.WEEK:
          neededElapsedTime = 7 * day;
          break;
        case Interval.MONTH:
          neededElapsedTime = 30 * day;
          break;
        case Interval.QUARTER:
          neededElapsedTime = 91 * day;
          break;
        case Interval.SEMESTER:
          neededElapsedTime = 182 * day;
          break;
        case Interval.YEAR:
          neededElapsedTime = 365 * day;
          break;
        case Interval.ONCE:
          return currentDate.getTime() >= event.date.getTime() && !event.lastTriggerTime;
      }
      return currentDate.getTime() - lastTriggerTime >= neededElapsedTime;
    }
    return false;
  }

  function calculate() {

    const utcStartDate = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));

    const dailyInterest = Math.pow(1 + kUSDSuperchargerAPY / 100, 1 / 365) - 1;
    //console.log(`dailyInterest: ${(100 * dailyInterest).toFixed(8)}%`);

    const dailyRedistributions = Math.pow(1 + simulatedRedistributionsAPY / 100, 1 / 365) - 1;
    //console.log(`dailyRedistributions: ${(100 * dailyRedistributions).toFixed(8)}%`);

    let currentDate = utcStartDate;
    const endDate = new Date(utcStartDate.getTime() + 24 * 3600 * 1000 * simulationDurationDays);

    let balanceValues = [];
    let neededFWTValues = [];
    let historicDepositFees = [];
    let historicWithdrawalFees = [];
    let historicNetWithdrawn = [];
    let deposits = []
    let withdrawals = []

    let lastBalance = 0;
    let totalNetWithdrawn = 0;
    let totalDeposited = 0;
    let totalDepositFees = 0;
    let totalWithdrawalFees = 0;

    let tempEvents = _.cloneDeep(events);

    lastBalance = startingBalance;

    if (startingDeposit) {
      const fees = startingDeposit * (kDepositFee / 100 + additionalDepositFees / 100);
      totalDepositFees += fees;
      lastBalance += startingDeposit - fees;
      deposits.push({ x: currentDate.getTime(), y: lastBalance, amount: startingDeposit, fees: fees});
    }

    balanceValues.push(lastBalance);
    neededFWTValues.push(lastBalance * kFWTRequirementRate / 100);
    historicDepositFees.push(totalDepositFees);
    historicWithdrawalFees.push(totalWithdrawalFees);
    historicNetWithdrawn.push(totalNetWithdrawn);

    while (currentDate.getTime() < endDate) {
      let currentBalance = lastBalance;
    
      // Advance date
      currentDate = new Date(currentDate.getTime() + 24 * 3600 * 1000);

      // Apply interest
      currentBalance = currentBalance * (1 + dailyInterest) * (1 + dailyRedistributions);

      // Apply daily events
      tempEvents.forEach((event) => {
        if (shouldTriggerEvent(event, currentDate, utcStartDate)) {
          event.lastTriggerTime = currentDate.getTime();
          switch (event.type) {
            case EventType.DEPOSIT:
            {
              const fees = event.value * (kDepositFee / 100 + additionalDepositFees / 100);
              totalDepositFees += fees;
              totalDeposited += event.value;
              currentBalance += event.value - fees;
              deposits.push({ x: currentDate.getTime(), y: currentBalance, amount: event.value, fees: fees});
              break;
            }
            case EventType.WITHDRAWAL:
            {
              const fees = event.value * (kWithdrawalFee / 100 + additionalWithdrawalFees / 100);
              totalWithdrawalFees += fees;
              currentBalance -= event.value;
              totalNetWithdrawn += event.value - fees;
              withdrawals.push({ x: currentDate.getTime(), y: currentBalance, amount: event.value, fees: fees});
              break;
            }
          }
        }
      });

      // Record historic values
      balanceValues.push(currentBalance);
      neededFWTValues.push(currentBalance * kFWTRequirementRate / 100);
      historicDepositFees.push(totalDepositFees);
      historicWithdrawalFees.push(totalWithdrawalFees);
      historicNetWithdrawn.push(totalNetWithdrawn);
      
      lastBalance = currentBalance;
    }

    const maxFWTNeeded = neededFWTValues.reduce((acc, value) => Math.max(acc, value), 0);

    setChartOptions({
      chart: {
        type: "spline",
        height: 600
      },
      title: {
        text: ""
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
            month: '%e. %b',
            year: '%b'
        },
        title: {
            text: 'Date'
        },
        crosshair: true
      },
      yAxis: [
        {
          title: 'Balance'
        },
        {
          title: '$',
          opposite: true,
          visible: false
        }
      ],

      tooltip: {
        formatter: function () {
          if (this.points){
            return this.points.reduce(function (s, point) {
                return s + '<br/>' + point.series.name + ': <b>$' +
                formatNumber(point.y, 2) + '</b>';
            }, '<b>' + formatDateUTC(new Date(this.x)) + '</b>');
          }
          else {
            if (this.point.series.name === 'Deposit') {
              return `<b>${formatDateUTC(new Date(this.x))}</b><br/>Deposited <b>$${formatNumber(this.point.amount, 2)}</b><br/>Paid <b>$${formatNumber(this.point.fees, 2)}</b> in fees<br/>Net balance increase <b>$${formatNumber(this.point.amount - this.point.fees, 2)}</b>`;
            }
            else if (this.point.series.name === 'Withdrawal') {
              return `<b>${formatDateUTC(new Date(this.x))}</b><br/>Withdrew <b>$${formatNumber(this.point.amount, 2)}</b><br/>Paid <b>$${formatNumber(this.point.fees, 2)}</b> in fees<br/>Received <b>$${formatNumber(this.point.amount - this.point.fees, 2)}</b>`;
            }
          }
        },
        shared: true
    },
      plotOptions: {
        series: {
          pointStart: utcStartDate.getTime(),
          pointInterval: 24 * 3600 * 1000,
          marker: {
            enabled: false
          }
        }
      },
      series: [
        {
          color: '#6CF',
          name: 'Supercharger Balance',
          data: balanceValues,
          tooltip: {
            valueDecimals: 2,
            valuePrefix: '$',
          }
        },
        {
          color: '#39F',
          name: 'FWT Stake required',
          data: neededFWTValues,
          tooltip: {
            valueDecimals: 2,
            valuePrefix: '$',
          }
        },
        {
          name: 'Maximum FWT Stake required',
          color: '#F00',
          data: neededFWTValues.map((x) => maxFWTNeeded),
          tooltip: {
            valueDecimals: 2,
            valuePrefix: '$',
            valueSuffix: ' in FWT',
          }
        },
        {
          name: 'Deposit',
          type: 'scatter',
          data: deposits,
          yAxis: 0,
          color: '#0F0',
          marker: {
            enabled: true
          },
          formatter: function () {
            return `<b>Deposited $${this.point.amount}<br/>`;
          },
        },
        {
          name: 'Withdrawal',
          type: 'scatter',
          data: withdrawals,
          yAxis: 0,
          color: '#00F',
          marker: {
            enabled: true
          }
        },
        {
          name: 'Total Withdrawal Fees',
          data: historicWithdrawalFees,
          visible: false,
          tooltip: {
            valueDecimals: 2,
            valuePrefix: '$',
          }
        },
        {
          name: 'Total Deposit Fees',
          data: historicDepositFees,
          visible: false,
          tooltip: {
            valueDecimals: 2,
            valuePrefix: '$',
          }
        },
        {
          name: 'Net Withdrawn',
          data: historicNetWithdrawn,
          visible: false,
          tooltip: {
            valueDecimals: 2,
            valuePrefix: '$',
          }
        },
      ]
    });
  }

  const handleStartingDateChange = (newValue) => { setStartDate(newValue); };
  const handleSimulationDurationChange = (e) => { setSimulationDurationDays(e.target.value); };
  const handleStartingBalanceChange = (e) => { setStartingBalance(parseFloat(e.target.value) || 0); };
  const handleStartingDepositChange = (e) => { setStartingDeposit(parseFloat(e.target.value) || 0); };

  const handleSimulateRedistributionsChange = (event) => { setSimulateRedistributions(event.target.checked); };
  const handleSimulatedRedistributionsAPYChange = (e) => { setSimulatedRedistributionsAPY(e.target.value); };

  const handleAdditionalDepositFeesChange = (e) => { setAdditionalDepositFees(e.target.value); };
  const handleAdditionalWithdrawalFeesChange = (e) => { setAdditionalWithdrawalFees(e.target.value); };

  const handleOpenAddEvent = () => { setOpen(true); };
  
  const handleAddEventClose = (value) => { setOpen(false); };
  const handleSaveShareClose = (value) => { setSaveShareOpen(false); };

  const handleNewEvent = (event) => { 
    let newEvents = _.cloneDeep(events);
    newEvents.push(event);
    setEvents(newEvents);
    setOpen(false);
  }

  const deleteEventAtIndex = (index) => {
    let newEvents = _.cloneDeep(events);
    newEvents.splice(index, 1);
    setEvents(newEvents);
  }

  const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

  const handleSave = () => {
    const data = {
      events: events,
      simulationDurationDays: simulationDurationDays,
      startingBalance: startingBalance,
      startingDeposit: startingDeposit,
      simulateRedistributions: simulateRedistributions,
      simulatedRedistributionsAPY: simulatedRedistributionsAPY,
      additionalDepositFees: additionalDepositFees,
      additionalWithdrawalFees: additionalWithdrawalFees,
      startDate: startDate.getTime()
    }
    const encoded = btoa(JSON.stringify(data))
    setSaveShareLink(`https://aubit-calculator.herokuapp.com/${encoded}`)
    setSaveShareOpen(true)
  }

  function stringifyEvent(event, index) {

    let string = "";
    switch(event.type) {
      case EventType.WITHDRAWAL:
        if (event.interval !== Interval.ONCE) {
          string = `Withdraw $${event.value} every ${event.interval}`;
        }
        else {
          string = `Withdraw $${event.value} on ${formatDateUTC(event.date)}`;
        }
        break;
      case EventType.DEPOSIT:
        if (event.interval !== Interval.ONCE) {
          string = `Deposit $${event.value} every ${event.interval}`;
        }
        else {
          string = `Deposit $${event.value} on ${formatDateUTC(event.date)}`;
        }
        break;
    }

    return (<li key={index}><Typography>{string}<IconButton onClick={() => deleteEventAtIndex(index)}><DeleteIcon color="secondary"></DeleteIcon></IconButton></Typography></li>);
  }

  return (
    <div>
      <Box sx={{ flexGrow: 1 }} m={5}>
        <Grid container spacing={{ xs: 2, lg: 3 }} columns={{ xs: 6 }}
        justifyContent="space-around"
        alignItems="center"
        >

          <Grid item xs={6}>
            <Paper elevation={2} style={{ padding: 20}}>
            <Stack spacing={1} direction="row" justifyContent="space-around">
              <DatePicker
                label="Simulation Start Date"
                inputFormat="dd/MM/yyyy"
                value={startDate}
                onChange={handleStartingDateChange}
                renderInput={(params) => <TextField {...params} />}
              />
              <TextField key="duration" label="Simulation Duration" type="number" value={simulationDurationDays}
              InputLabelProps={{ shrink: true }}
              InputProps={{ endAdornment: <InputAdornment position="end">Days</InputAdornment> }}
              onChange={handleSimulationDurationChange}/>
              <TextField key="starting-balance" label="Starting Balance" type="number" value={startingBalance}
              InputLabelProps={{ shrink: true }}
              InputProps={{ endAdornment: <InputAdornment position="end">USD</InputAdornment> }}
              onChange={handleStartingBalanceChange}/>
              <TextField key="starting-deposit"  label="Starting deposit" type="number" value={startingDeposit}
              InputLabelProps={{ shrink: true }}
              InputProps={{ endAdornment: <InputAdornment position="end">USD</InputAdornment> }}
              onChange={handleStartingDepositChange}/>
            </Stack>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper elevation={2} style={{ padding: 20}}>
          <Stack spacing={1} direction="row" justifyContent="space-around">
          <FormControlLabel
              control={
                <Checkbox label="Numxber" checked={simulateRedistributions} onChange={handleSimulateRedistributionsChange} name="redistributions" />
              }
              label="Simulate Arbitrary Fee Redistributions"
            />
            { simulateRedistributions ?
            <TextField type="number"
              label="Fee Redistributions APY"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', step: "0.1" }}
              InputLabelProps={{ shrink: true }}
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              value={simulatedRedistributionsAPY}
              onChange={handleSimulatedRedistributionsAPYChange}/>: null }
              <Button variant="contained" onClick={handleOpenAddEvent}>Add Event</Button>
              <Button variant="contained" onClick={handleSave}>Share/Save</Button>
            </Stack>
            </Paper>
          </Grid>
          <Grid item xs={6}>
          <Paper elevation={2} style={{ padding: 20}}>
            <Stack spacing={1} direction="row" justifyContent="space-around">
              <TextField label="Additional Deposit Fees" type="number" value={additionalDepositFees}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', step: "0.1" }}
                InputLabelProps={{ shrink: true }}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                onChange={handleAdditionalDepositFeesChange}/>
            <TextField label="Additional Withdrawal Fees" type="number" value={additionalWithdrawalFees}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', step: "0.1" }}
              InputLabelProps={{ shrink: true }}
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              onChange={handleAdditionalWithdrawalFeesChange}/>
            </Stack>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Item>
              <HighchartsReact highcharts={Highcharts} options={chartOptions} />
            </Item>
          </Grid>
        </Grid>
        <ul>
          {events.map((e, index) => stringifyEvent(e, index))} 
        </ul>
      </Box>
      <AddEventDialog
      open={open}
      onClose={handleAddEventClose}
      onSave={handleNewEvent}/> 
    <SaveShareDialog
      link={saveShareLink}
      open={saveShareOpen}
      onClose={handleSaveShareClose}/> 
    </div>
  );
}


export default App;
