import React, { useState, useEffect, useCallback } from "react";
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

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';


import DeleteIcon from '@mui/icons-material/Delete';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
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
  DAY: "day",            // 1 day
  WEEK: "week",          // 7 days
  MONTH: "month",        // 30 days
  QUARTER: "quarter",    // 91 days
  SEMESTER: "semester",  // 182 days
  EVERY_YEAR: "every year",          // 365 days
  ONCE: "once",
};

const EventType = {
  DEPOSIT: "deposit",                       // Periodic deposit of constant amount
  WITHDRAWAL: "withdrawal",                 // Periodic withdrawal of constant amount
  PERCENTAGE_WITHDRAWAL: "percentage withdrawal"  // Periodic withdrawal of percentage of balance
};

SaveShareDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
};

function SaveShareDialog(props) {

  const { onClose, open, link } = props;

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
        <DialogContentText style={{ overflow: "hidden", textOverflow: "ellipsis", width: '500px' }}>{link}</DialogContentText>
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

  const { onClose, onSave, open, supercharger } = props;

  const [type, setType] = React.useState(EventType.WITHDRAWAL);
  const [interval, setInterval] = React.useState(Interval.MONTH);
  const [value, setValue] = React.useState(0);
  const [date, setDate] = React.useState(null);
  const [name, setName] = React.useState("");

  const handleClose = () => {
    onClose();
  };

  const save = (x) => {
    const newEvent = {
      type: type,
      interval: interval,
      value: value,
      date: date,
      name: name
    };
    onSave(newEvent);
  };

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const handleTypeChange = (event) => { setType(event.target.value); };
  const handleIntervalChange = (event) => { setInterval(event.target.value); };
  const handleValueChange = (event) => { setValue(event.target.value); };
  const handleDateChange = (newValue) => { setDate(newValue); };
  const handleNameChange = (event) => { setName(event.target.value); };

  return (
    <Dialog onClose={handleClose} open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
      <DialogTitle>Add New Order</DialogTitle>
      <DialogContent >
        <Grid container spacing={{ xs: 2 }} columns={{ xs: 3 }}>
          <Grid item xs={3} padding={3}>
          </Grid>
          <Grid item xs={3} padding={3}>
            <TextField label="Name" type="text" value={name} placeholder="Self-Payday"
              InputLabelProps={{ shrink: true }}
              onChange={handleNameChange} />
          </Grid>
          <Grid item xs={3}>

            <FormControl fullWidth required variant="outlined">
              <InputLabel shrink required={false} htmlFor="type">Type</InputLabel>
              <Select
                id="type"
                value={type}
                label="Type"
                onChange={handleTypeChange}
              >
                <MenuItem value={EventType.WITHDRAWAL}>{capitalize(EventType.WITHDRAWAL)}</MenuItem>
                <MenuItem value={EventType.PERCENTAGE_WITHDRAWAL}>{capitalize(EventType.PERCENTAGE_WITHDRAWAL)}</MenuItem>
                <MenuItem value={EventType.DEPOSIT}>{capitalize(EventType.DEPOSIT)}</MenuItem>
              </Select>
            </FormControl>

          </Grid>

          <Grid item xs={3}>
            <FormControl fullWidth required variant="outlined">
              <InputLabel shrink required={false} htmlFor="interval">Interval</InputLabel>
              <Select
                id="interval"
                value={interval}
                label="Interval"
                onChange={handleIntervalChange}
              >
                <MenuItem value={Interval.ONCE}>{capitalize(Interval.ONCE)}</MenuItem>
                <MenuItem value={Interval.DAY}>{capitalize(Interval.DAY)}</MenuItem>
                <MenuItem value={Interval.WEEK}>{capitalize(Interval.WEEK)}</MenuItem>
                <MenuItem value={Interval.MONTH}>{capitalize(Interval.MONTH)}</MenuItem>
                <MenuItem value={Interval.QUARTER}>{capitalize(Interval.QUARTER)}</MenuItem>
                <MenuItem value={Interval.SEMESTER}>{capitalize(Interval.SEMESTER)}</MenuItem>
                <MenuItem value={Interval.EVERY_YEAR}>{capitalize(Interval.EVERY_YEAR)}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <TextField label="Amount" type="number" value={value}
              InputLabelProps={{ shrink: true }}
              InputProps={{ endAdornment: type === EventType.PERCENTAGE_WITHDRAWAL ? <InputAdornment position="end">%</InputAdornment> : <InputAdornment position="end">{supercharger.name}</InputAdornment> }}
              onChange={handleValueChange} />
          </Grid>

          {interval === Interval.ONCE || interval === Interval.EVERY_YEAR ? <Grid item xs={3}>
            <DatePicker
              label="Date"
              inputFormat="dd/MM/yyyy"
              value={date}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} />} />
          </Grid> : null}

        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={save}>Save</Button>
      </DialogActions>

    </Dialog>
  );
}

const kReferredBonus = 2;

const kSuperchargers = [
  {
    symbol: '$',
    trailing: false,
    name: "USD",
    baseAR: 20,
    noticePeriodBonus: 10,
    fwtBonus: 10,
    activityScoreBonus: 3,
    showFWTRequirement: true,
    decimals: 2
  },
  {
    symbol: '€',
    trailing: true,
    name: "EURO",
    baseAR: 20,
    noticePeriodBonus: 10,
    fwtBonus: 10,
    activityScoreBonus: 3,
    showFWTRequirement: true,
    decimals: 2
  },
  {
    symbol: 'BTC',
    trailing: true,
    name: "BTC",
    baseAR: 20,
    noticePeriodBonus: 10,
    fwtBonus: 10,
    activityScoreBonus: 3,
    showFWTRequirement: false,
    decimals: 8
  },
  {
    symbol: 'Ξ',
    trailing: true,
    name: "ETH",
    baseAR: 20,
    noticePeriodBonus: 10,
    fwtBonus: 10,
    activityScoreBonus: 3,
    showFWTRequirement: false,
    decimals: 4
  },
  {
    symbol: 'ADA',
    trailing: true,
    name: "ADA",
    baseAR: 10,
    noticePeriodBonus: 5,
    fwtBonus: 5,
    activityScoreBonus: 1.5,
    showFWTRequirement: false,
    decimals: 4
  },
  {
    symbol: 'DOT',
    trailing: true,
    name: "DOT",
    baseAR: 10,
    noticePeriodBonus: 5,
    fwtBonus: 5,
    activityScoreBonus: 1.5,
    showFWTRequirement: false,
    decimals: 4
  },
  {
    symbol: 'ADA',
    trailing: true,
    name: "ADA",
    baseAR: 10,
    noticePeriodBonus: 5,
    fwtBonus: 5,
    activityScoreBonus: 1.5,
    showFWTRequirement: false,
    decimals: 4
  },
  {
    symbol: 'BNB',
    trailing: true,
    name: "BNB",
    baseAR: 10,
    noticePeriodBonus: 5,
    fwtBonus: 5,
    activityScoreBonus: 1.5,
    showFWTRequirement: false,
    decimals: 4
  }
];

function App() {

  /** rate of FWT stake needed to power superchargers */
  const kFWTRequirementRate = 5;

  // Base fees for all superchargers
  const kDepositFee = 0.00;
  const kWithdrawalFee = 0.00;

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

  /** whether to add the FWT Holding bonus to the AR */
  const [fwtBonus, setFWTBonus] = useState(true);

  /** Notice period in days */
  const [noticePeriodDays, setNoticePeriodDays] = useState(30);

  /** Whether the user was referred */
  const [referred, setReferred] = useState(true);

  /** whether to add the FWT Holding bonus to the AR */
  const [activityScoreBonus, setActivityScoreBonus] = useState(true);

  /** additional deposit fees depending on the payment method and currency */
  const [additionalDepositFees, setAdditionalDepositFees] = useState(0.23);

  /** date at which the simulation starts */
  const [startDate, setStartDate] = useState(currentDateStartOfDayUTC());

  /** how long the simulation should run for in days*/
  const [simulationDurationDays, setSimulationDurationDays] = useState(365);

  /** what the AR adds up to with all the bonuses */
  const [ar, setAR] = useState(0);

  const [superchargerStakingAR, setSuperchargerStakingAR] = useState(0);

  /** currency symbol */
  const [symbol, setSymbol] = useState("$");

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

        const events = data.events.map((e) => {
          e.date = new Date(e.date);
          return e;
        })

        setEvents(events);
        setSimulationDurationDays(data.simulationDurationDays);
        setStartingBalance(data.startingBalance);
        setStartingDeposit(data.startingDeposit);
        setFWTBonus(data.fwtBonus);
        setActivityScoreBonus(data.activityScoreBonus);
        setNoticePeriodDays(data.noticePeriodDays);
        setAdditionalDepositFees(data.additionalDepositFees);
        setReferred(data.referred);
        setStartDate(new Date(data.startDate));
        setSymbol(data.symbol || "$");
      }
    }
    catch (e) {
      console.log(e);
    }
  }, [params]);

  const [chartOptions, setChartOptions] = useState({});

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

    return (number).toLocaleString(['en-US'], {
      localeMatcher: 'lookup',
      style: 'decimal',
      maximumFractionDigits: maximumFractionDigits,
    });
  }

  const formatCurrency = useCallback((value, supercharger) => {
    return `${!supercharger.trailing ? supercharger.symbol : ""}${formatNumber(parseFloat(value), supercharger.decimals)} ${supercharger.trailing ? supercharger.symbol : ""}`
  }, []);

  function shouldTriggerEvent(event, currentDate, startDate) {
    if (event.interval) {
      const lastTriggerTime = event.lastTriggerTime || startDate.getTime();
      const day = 24 * 3600 * 1000;

      let neededElapsedTime = 0;
      switch (event.interval) {
        case Interval.DAY:
          neededElapsedTime = 1 * day;
          break;
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
        case Interval.EVERY_YEAR:
          const targetDate = event.date.getUTCDate();
          const targetMonth = event.date.getUTCMonth();
          return currentDate.getUTCDate() === targetDate && currentDate.getUTCMonth() === targetMonth;
        case Interval.ONCE:
          return currentDate.getTime() >= event.date.getTime() && !event.lastTriggerTime;
      }
      return currentDate.getTime() - lastTriggerTime >= neededElapsedTime;
    }
    return false;
  }

  useEffect(() => {

    const supercharger = kSuperchargers.find((sc) => sc.symbol === symbol);

    let noticePeriodBonus = 0;
    switch (noticePeriodDays) {
      case 3:
        noticePeriodBonus = 0.25 * supercharger.noticePeriodBonus;
        break;
      case 7:
        noticePeriodBonus = 0.5 * supercharger.noticePeriodBonus;
        break;
      case 15:
        noticePeriodBonus = 0.75 * supercharger.noticePeriodBonus;
        break;
      case 30:
        noticePeriodBonus = 1 * supercharger.noticePeriodBonus;
        break;
    }

    const superchargerStakingAR = supercharger.baseAR + noticePeriodBonus +
      (fwtBonus ? supercharger.fwtBonus : 0) +
      (activityScoreBonus ? supercharger.activityScoreBonus : 0);

    setSuperchargerStakingAR(superchargerStakingAR);

    const superchargerStakingDailyRewards = Math.pow(1 + superchargerStakingAR / 100, 1 / 365) - 1;

    const finalDailyRewards = superchargerStakingDailyRewards * (referred ? (100 + kReferredBonus) / 100 : 1);
    let compoundedDailyRewards = (100 * (Math.pow(1 + finalDailyRewards, 365) - 1)).toFixed(2);
    setAR(compoundedDailyRewards)

  }, [symbol, fwtBonus, activityScoreBonus, noticePeriodDays, referred])

  const calculate = useCallback(() => {
    console.log('calculate' + ar);
    const supercharger = kSuperchargers.find((sc) => sc.symbol === symbol)

    const utcStartDate = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));

    const dailyRewards = Math.pow(1 + ar / 100, 1 / 365) - 1;
    //console.log(`dailyInterest: ${(100 * dailyInterest).toFixed(8)}%`);

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
    let totalDepositFees = 0;
    let totalWithdrawalFees = 0;

    let tempEvents = _.cloneDeep(events);

    lastBalance = startingBalance;

    if (startingDeposit) {
      const fees = startingDeposit * (kDepositFee / 100 + additionalDepositFees / 100);
      totalDepositFees += fees;
      lastBalance += startingDeposit - fees;
      deposits.push({ x: currentDate.getTime(), y: lastBalance, amount: startingDeposit, fees: fees });
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

      // Apply rewards
      currentBalance = currentBalance * (1 + dailyRewards);

      // Apply daily events
      tempEvents.forEach((event) => {
        if (shouldTriggerEvent(event, currentDate, utcStartDate)) {
          event.lastTriggerTime = currentDate.getTime();
          switch (event.type) {
            case EventType.DEPOSIT:
              {
                const fees = event.value * (kDepositFee / 100 + additionalDepositFees / 100);
                totalDepositFees += fees;
                //totalDeposited += event.value;
                currentBalance += event.value - fees;
                deposits.push({ x: currentDate.getTime(), y: currentBalance, amount: event.value, fees: fees, name: event.name });
                break;
              }
            case EventType.WITHDRAWAL:
              {
                const fees = event.value * (kWithdrawalFee / 100);
                totalWithdrawalFees += fees;
                currentBalance -= event.value;
                totalNetWithdrawn += event.value - fees;
                withdrawals.push({ x: currentDate.getTime(), y: currentBalance, amount: event.value, fees: fees, name: event.name });
                break;
              }
            case EventType.PERCENTAGE_WITHDRAWAL:
              {
                const value = event.value * currentBalance / 100;
                const fees = value * (kWithdrawalFee / 100);
                totalWithdrawalFees += fees;
                currentBalance -= value;
                totalNetWithdrawn += value - fees;
                withdrawals.push({ x: currentDate.getTime(), y: currentBalance, amount: value, fees: fees, name: event.name });
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

    const series = [
      {
        color: '#6CF',
        name: 'Supercharger Balance',
        data: balanceValues,
        tooltip: {
          valueDecimals: 2,
          valuePrefix: supercharger.symbol,
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
          return `<b>Deposited ${supercharger.symbol}${this.point.amount}<br/>`;
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
        name: 'Net Withdrawn',
        data: historicNetWithdrawn,
        visible: false,
        tooltip: {
          valueDecimals: 2,
          valuePrefix: supercharger.symbol,
        }
      },
    ]

    if (supercharger.showFWTRequirement) {
      series.push({
        color: '#39F',
        name: 'FWT Stake required',
        data: neededFWTValues,
        tooltip: {
          valueDecimals: 2,
          valuePrefix: supercharger.symbol,
        }
      });
      series.push({
        name: 'Maximum FWT Stake required',
        color: '#F00',
        data: neededFWTValues.map((x) => maxFWTNeeded),
        tooltip: {
          valueDecimals: 2,
          valuePrefix: supercharger.symbol,
          valueSuffix: ' in FWT',
        }
      });
    }

    setChartOptions({
      chart: {
        type: "spline",
        height: 400
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
          title: supercharger.symbol,
          opposite: true,
          visible: false
        }
      ],

      tooltip: {
        formatter: function () {
          if (this.points) {
            return this.points.reduce(function (s, point) {
              return s + '<br/>' + point.series.name + `: <b> ${formatCurrency(point.y, supercharger)}</b>`;
            }, '<b>' + formatDateUTC(new Date(this.x)) + '</b>');
          }
          else {
            if (this.point.series.name === 'Deposit') {
              return `<b>${formatDateUTC(new Date(this.x))}</b><br/>${this.point.name ? this.point.name : ""}<br/>Deposited <b>${formatCurrency(this.point.amount, supercharger)}</b><br/>Paid <b>${formatCurrency(this.point.fees, supercharger)}</b> in fees<br/>Net balance increase <b>${supercharger.symbol}${formatNumber(this.point.amount - this.point.fees, 2)}</b>`;
            }
            else if (this.point.series.name === 'Withdrawal') {
              return `<b>${formatDateUTC(new Date(this.x))}</b><br/>${this.point.name ? this.point.name : ""}<br/>Withdrew <b>${formatCurrency(this.point.amount, supercharger)}</b><br/>Paid <b>${formatCurrency(this.point.fees, supercharger)}</b> in fees<br/>Received <b>${supercharger.symbol}${formatNumber(this.point.amount - this.point.fees, 2)}</b>`;
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
      series: series
    });
  }, [additionalDepositFees, ar, events, formatCurrency, simulationDurationDays, startDate, startingBalance, startingDeposit, symbol]);

  useEffect(() => {
    calculate();
  }, [events, startDate, simulationDurationDays, additionalDepositFees, ar, startingBalance, startingDeposit, symbol, calculate])

  const handleStartingDateChange = (newValue) => { setStartDate(newValue); };
  const handleSimulationDurationChange = (e) => { setSimulationDurationDays(e.target.value); };
  const handleStartingBalanceChange = (e) => { setStartingBalance(parseFloat(e.target.value) || 0); };
  const handleStartingDepositChange = (e) => { setStartingDeposit(parseFloat(e.target.value) || 0); };

  const handleFWTBonusChange = (event) => { setFWTBonus(event.target.checked); };
  const handleActivityScoreBonusChange = (event) => { setActivityScoreBonus(event.target.checked); };
  const handleReferredChange = (event) => { setReferred(event.target.checked); };

  const handleNoticePeriodDaysChange = (event) => { setNoticePeriodDays(event.target.value) };

  const handleAdditionalDepositFeesChange = (e) => { setAdditionalDepositFees(e.target.value); };

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

  const handleSymbolChange = (event) => {
    setSymbol(event.target.value)
  }

  const handleSave = () => {
    const data = {
      events: events,
      simulationDurationDays: simulationDurationDays,
      startingBalance: startingBalance,
      startingDeposit: startingDeposit,
      fwtBonus: fwtBonus,
      activityScoreBonus: activityScoreBonus,
      noticePeriodDays: noticePeriodDays,
      referred: referred,
      additionalDepositFees: additionalDepositFees,
      startDate: startDate.getTime(),
      symbol: symbol
    }
    const encoded = btoa(JSON.stringify(data))
    setSaveShareLink(`https://aubit-calculator.herokuapp.com/${encoded}`)
    setSaveShareOpen(true)
  }

  function stringifyEvent(event, index) {

    let string = "";
    switch (event.type) {
      case EventType.WITHDRAWAL:
        if (event.interval === Interval.ONCE) {
          string = `Withdraw ${formatCurrency(event.value, supercharger)} on ${formatDateUTC(event.date)}`;
        }
        else if (event.interval === Interval.EVERY_YEAR) {
          string = `Withdraw ${formatCurrency(event.value, supercharger)} every year on ${event.date.getUTCDate()}/${event.date.getUTCMonth() + 1}`;
        }
        else {
          string = `Withdraw ${formatCurrency(event.value, supercharger)} every ${event.interval}`;
        }
        break;
      case EventType.PERCENTAGE_WITHDRAWAL:
        if (event.interval === Interval.ONCE) {
          string = `Withdraw ${event.value}% on ${formatDateUTC(event.date)}`;
        }
        else if (event.interval === Interval.EVERY_YEAR) {
          string = `Withdraw ${event.value}% every year on ${event.date.getUTCDate()}/${event.date.getUTCMonth() + 1}`;
        }
        else {
          string = `Withdraw ${event.value}% every ${event.interval}`;
        }
        break;
      case EventType.DEPOSIT:
        if (event.interval === Interval.ONCE) {
          string = `Deposit ${formatCurrency(event.value, supercharger)} on ${formatDateUTC(event.date)}`;
        }
        else if (event.interval === Interval.EVERY_YEAR) {
          string = `Deposit ${formatCurrency(event.value, supercharger)} every year on ${event.date.getUTCDate()}/${event.date.getUTCMonth() + 1}`;
        }
        else {
          string = `Deposit ${formatCurrency(event.value, supercharger)} every ${event.interval}`;
        }
        break;
    }

    return (<li key={index}><Typography>{event.name ? `${event.name}: ` : ""}{string}<IconButton onClick={() => deleteEventAtIndex(index)}><DeleteIcon color="secondary"></DeleteIcon></IconButton></Typography></li>);
  }

  const supercharger = kSuperchargers.find((sc) => sc.symbol === symbol)

  return (
    <div>
      <Box sx={{ flexGrow: 1 }} m={2}>
        <Grid container spacing={{ xs: 2, lg: 3 }} columns={{ xs: 6 }}
          justifyContent="space-around"
          alignItems="center"
        >

          <Grid item xs={6}>
            <Paper elevation={2} style={{ padding: 10 }}>
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
                  onChange={handleSimulationDurationChange} />
                <TextField key="starting-balance" label="Starting Balance" type="number" value={startingBalance}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ endAdornment: <InputAdornment position="end">{supercharger.name}</InputAdornment> }}
                  onChange={handleStartingBalanceChange} />
                <TextField key="starting-deposit" label="Starting deposit" type="number" value={startingDeposit}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ endAdornment: <InputAdornment position="end">{supercharger.name}</InputAdornment> }}
                  onChange={handleStartingDepositChange} />

                <FormControl required variant="outlined">
                  <InputLabel shrink required={false} htmlFor="buy-in-fee">Deposit using</InputLabel>
                  <Select
                    id="type"
                    value={additionalDepositFees}
                    label="Buy in using"
                    onChange={handleAdditionalDepositFeesChange}
                  >
                    <MenuItem value={0.23}>Coinremitter (0.23% fee, faster)</MenuItem>
                    <MenuItem value={0}>OTC (0% fee, slower)</MenuItem>
                  </Select>
                </FormControl>
                <FormControl required variant="outlined">
                  <InputLabel shrink required={false} htmlFor="type">Type</InputLabel>
                  <Select
                    id="type"
                    value={symbol}
                    label="Type"
                    onChange={handleSymbolChange}
                  >
                    {kSuperchargers.map(function (object, i) {
                      return <MenuItem value={object.symbol} key={i}>{object.name}</MenuItem>;
                    })}
                  </Select>
                </FormControl>


              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper elevation={2} style={{ padding: 20 }}>
              <Stack spacing={1} direction="row" justifyContent="space-around">
                <Stack spacing={1} direction="column" justifyContent="space-around">
                  <FormControl required variant="outlined">
                    <FormControlLabel
                      control={
                        <Checkbox checked={fwtBonus} onChange={handleFWTBonusChange} name="fwt-bonus" />
                      }
                      label={`FWT Holding Bonus (${supercharger.fwtBonus}%)`}
                    />
                  </FormControl>
                  <FormControl required variant="outlined">
                    <FormControlLabel
                      control={
                        <Checkbox checked={activityScoreBonus} onChange={handleActivityScoreBonusChange} name="fwt-bonus" />
                      }
                      label={`Activity Score Bonus (${supercharger.activityScoreBonus}%)`}
                    />
                  </FormControl>
                  <FormControl required variant="outlined">
                    <InputLabel shrink required={false} htmlFor="notice-period-days">Notice Period</InputLabel>
                    <Select
                      id="notice-period-days"
                      value={noticePeriodDays}
                      label="Notice Period"
                      onChange={handleNoticePeriodDaysChange}
                    >
                      <MenuItem value={0}>0 Days</MenuItem>
                      <MenuItem value={3}>3 Days (+{0.25 * supercharger.noticePeriodBonus}%)</MenuItem>
                      <MenuItem value={7}>7 Days (+{0.5 * supercharger.noticePeriodBonus}%)</MenuItem>
                      <MenuItem value={15}>15 Days (+{0.75 * supercharger.noticePeriodBonus}%)</MenuItem>
                      <MenuItem value={30}>30 Days (+{supercharger.noticePeriodBonus}%)</MenuItem>
                    </Select>

                  </FormControl>
                  <Typography>Supercharger Staking AR <b>{superchargerStakingAR}%</b></Typography>
                  <FormControl required variant="outlined">
                    <FormControlLabel
                      control={
                        <Checkbox checked={referred} onChange={handleReferredChange} name="referred-bonus" />
                      }
                      label={`Were you referred? (+2% daily rewards)`}
                    />
                  </FormControl>
                  <Typography>Final AR <b>{ar}%</b></Typography>
                </Stack>
                <Stack spacing={1} direction="column" justifyContent="space-around">
                <Button variant="contained" onClick={handleOpenAddEvent}>Add Event</Button>
                <Button variant="contained" onClick={handleSave}>Share/Save</Button>
                </Stack>
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
        supercharger={supercharger}
        onClose={handleAddEventClose}
        onSave={handleNewEvent} />
      <SaveShareDialog
        link={saveShareLink}
        open={saveShareOpen}
        onClose={handleSaveShareClose} />
    </div>
  );
}


export default App;
