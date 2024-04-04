function findPreviousAndNext(dates, values, targetDate) {
    let prevDate = null
    let nextDate = null
    let prevValue = null
    let nextValue = null
  
    for (let i = 0; i < dates.length; i++) {
      if (dates[i] <= targetDate) {
        prevDate = dates[i]
        prevValue = values[i]
      } else {
        nextDate = dates[i]
        nextValue = values[i]
        break
      }
    }
  
    return { prevDate, nextDate, prevValue, nextValue }
  }
  
  function handleOutOfRange(prevValue, nextValue) {
    return prevValue === null ? nextValue : prevValue
  }
  
  function interpolate(prevDate, nextDate, prevValue, nextValue, targetDate) {
    const ratio = (targetDate - prevDate) / (nextDate - prevDate)
    return [prevValue + ratio * (nextValue - prevValue)]
  }
  
  const dates = [
    new Date(2022, 1, 1), // 1 feb
    new Date(2022, 1, 6), // 6 feb
    new Date(2022, 1, 11), // 11 feb
    new Date(2022, 1, 16), // 16 feb
    new Date(2022, 1, 21), // 21 feb
    new Date(2022, 1, 26), // 26 feb
    new Date(2022, 2, 2), // 2 mar
  ]; 
  console.log(dates)
  
  const values = [0.401, 0.431, 0.461, 0.494, 0.527, 0.56, 0.598];
  console.log(values)
  
  const targetDate = [
    new Date(2022, 1, 2), // 2 feb
    new Date(2022, 1, 3), // 3 feb
    new Date(2022, 1, 4), // 4 feb
    new Date(2022, 1, 5), // 5 feb
    new Date(2022, 1, 7), // 7 feb
    new Date(2022, 1, 8), // 8 feb
    new Date(2022, 1, 9), // 9 feb
    new Date(2022, 1, 10), // 10 feb
    new Date(2022, 1, 12), // 12 feb
    new Date(2022, 1, 13), // 13 feb
    new Date(2022, 1, 14), // 14 feb
    new Date(2022, 1, 15), // 15 feb
    new Date(2022, 1, 17), // 17 feb
    new Date(2022, 1, 18), // 18 feb
    new Date(2022, 1, 19), // 19 feb
    new Date(2022, 1, 20), // 20 feb
    new Date(2022, 1, 22), // 22 feb
    new Date(2022, 1, 23), // 23 feb
    new Date(2022, 1, 24), // 24 feb
    new Date(2022, 1, 25), // 25 feb
    new Date(2022, 1, 27), // 27 feb
    new Date(2022, 1, 28), // 28 feb
    new Date(2022, 1, 29), // 29 feb
    new Date(2022, 2, 1), // 1 mar
    new Date(2022, 2, 3), // 3 mar
    new Date(2022, 2, 4), // 4 mar
    new Date(2022, 2, 5), // 5 mar
    new Date(2022, 2, 6), // 6 mar
  ];
  console.log(targetDate)
  
  function interpolateData(dates, values, targetDate) {
    const interpolatedValues = [];
  
    for (let i = 0; i < targetDate.length; i++) {
      const { prevDate, nextDate, prevValue, nextValue } = findPreviousAndNext(
        dates,
       values,
        targetDate[i]
      );
  
      interpolatedValues.push(
        interpolate(prevDate, nextDate, prevValue, nextValue, targetDate[i])
      );
    }
  
    return interpolatedValues;
  }
  
  console.log(interpolateData(dates, values, targetDate));