/**
 * @module SSBIntegration
 */ /** for typedoc */

const E = 2.7182818284;
const windowLength = 1 * 60 * 1000;
const currentTickList: Array<{
  stack: string,
  now: Date
}> = [];

const stahp = document.createElement('a');
stahp.setAttribute('style', 'color: red; margin-top: 64px; right: 50px; z-index: 10000; position: absolute');

stahp.addEventListener('click', () => {
  const aggregates = currentTickList.reduce((acc, x) => {
    const count = acc.get(x.stack) || 0;
    acc.set(x.stack, count + 1);
    return acc;
  }, new Map());

  const sortedKeys = Array.from(aggregates.keys()).sort((a, b) => {
    return (aggregates.get(b) || 0) - (aggregates.get(a) || 0);
  });

  console.log('**** Top stacks for timer thrashers ****'); //tslint:disable-line:no-console
  sortedKeys.forEach((x) => console.log(`${aggregates.get(x)} entries:\n${x}`)); //tslint:disable-line:no-console

  window.alert('Check the DevTools Console for a list of stacks where noisy timers were created');
});


function fontSizeFromInterval(averageTimerDuration: number): number {
  // https://www.mycurvefit.com/
  // Exponential => Proportional rate decrease
  // 250 => 50px
  // 10000 => 15px
  // 15000 => 8px
  // 30000 => 4px
  return 51.7042 - (0.006689909 / 0.0001367918) * (1 - Math.pow(E, (-0.0001367918 * averageTimerDuration)));
}

function opacityFromInterval(averageTimerDuration: number): number {
  // https://www.mycurvefit.com/
  // Quadratic fit
  // 250 => 1.0
  // 1000 => 0.8
  // 10000 => 0.5
  // 15000 => 0.1
  // 30000 => 0
  // Drop the squared term because it's basically zero
  return 0.9595415 - 0.00006997902 * averageTimerDuration;
}

function addAndMaintainTickList(stack?: string) {
  const toAdd = { stack: stack!, now: new Date() };
  if (stack) currentTickList.push(toAdd);

  const laterThan = new Date(toAdd.now.getTime() - windowLength);
  while (currentTickList.length > 0 && currentTickList[0].now < laterThan) {
    currentTickList.shift();
  }

  const averageTimerDuration = windowLength / currentTickList.length;
  const opacity = opacityFromInterval(averageTimerDuration);

  if (opacity < 0.05) {
    stahp.style.display = 'none';
    return;
  } else {
    stahp.style.display = 'inline';
  }

  stahp.style.fontSize = `${fontSizeFromInterval(averageTimerDuration)}px`;
  stahp.style.opacity = opacity.toString();
  stahp.style.fontFamily = (parseInt(stahp.style.opacity, 10) > 0.7 ? 'Comic Sans MS' : 'Slack-Lato');

  stahp.innerText = `A timer is firing on average every ${Math.round(averageTimerDuration)}ms`;
}

document.body.appendChild(stahp);
setInterval(() => addAndMaintainTickList(), 1000);

const origSetTimeout = window.setTimeout;
window.setTimeout = function(callback: (...args: Array<any>) => void, delay: number, ...args: Array<any>) {
  let stack: string;
  try {
    throw new Error();
  } catch (e) {
    stack = e.stack;
  }

  if (!delay || delay < 100) {
    //tslint:disable-next-line:no-console
    console.error(`Calling setTimeout with a low delay is Bad, use requestAnimationFrame instead!\n${stack}}`);
  }

  return origSetTimeout((...a: Array<any>) => {
    addAndMaintainTickList(stack);
    callback(...a);
  }, delay, ...args);
};

const origSetInterval = window.setInterval;
window.setInterval = function(callback: (...args: Array<any>) => void, delay: number, ...args: Array<any>): number {
  let stack: string;
  try {
    throw new Error();
  } catch (e) {
    stack = e.stack;
  }

  if (!delay || delay < 100) {
    //tslint:disable-next-line:no-console
    console.error(`Calling setInterval with a low delay is Very Bad, use requestAnimationFrame instead!\n${stack}}`);
  }

  return origSetInterval((...a: Array<any>) => {
    addAndMaintainTickList(stack);
    callback(...a);
  }, delay, ...args);
};
