var data = [
    {
      name: 'Venkatesh',
      age: 30,
      gender: 'M', // M or F
      birthChoice: 'LB' // LB , UB, MB, SL, SU
    }
  ]
  
  async function delay(timeout) {
    await new Promise((resolve) => setTimeout(resolve, timeout));
  }
  
  
  function waitForElementDisplayed(locator, timeout = 35000, interval = 100) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
  
      const check = () => {
        const element = document.evaluate(locator, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        const isVisible = element && element.offsetParent !== null;
  
        if (isVisible) {
          resolve(element);
        } else if (Date.now() - start > timeout) {
          reject(new Error(`Element not displayed within timeout. - ${locator}`));
        } else {
          setTimeout(check, interval);
        }
      };
  
      check();
    });
  }
  
  async function setValueToInput(locator, valueToSet) {
    const element = await waitForElementDisplayed(locator);
    await element.focus();
    element.value = valueToSet;
    pageDirty(element);
  }
  
  
  async function clickElm(locator) {
    await delay(300);
    const element = await waitForElementDisplayed(locator);
    await element.click();
  }
  
  async function autoFocus(locator) {
    const element = await waitForElementDisplayed(locator);
    await delay(400);
    await element.blur();
    await element.focus();
  }
  
  
  function pageDirty(input) {
    // Trigger the 'input' event to notify Angular
    input.dispatchEvent(new Event('input', { bubbles: true }));
  
    // Optional: trigger 'change' as well
    input.dispatchEvent(new Event('change', { bubbles: true }));
  
    // Wait a bit for suggestions to load (if applicable)
    setTimeout(() => {
      // Arrow down to highlight the first suggestion
      input.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        code: 'ArrowDown',
        keyCode: 40,
        which: 40,
        bubbles: true,
      }));
  
      // Press enter to select the suggestion
      input.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
      }));
  
      // Optional: blur the field to trigger validation state update
      input.blur();
    }, 400);
  }
  
  
  async function enterDetailsAndPay() {
  
    for (let i = 0; i < data.length; i++) {
      await delay(350);
      // click add passenger
      if (i != 0) {
        await clickElm("//a//span[contains(text(),'Add Passenger')]");
      }
  
      // Enter name
      await setValueToInput("(//p-autocomplete[@formcontrolname='passengerName']//input)[last()]", data[i].name);
  
      // Enter age
      await setValueToInput("(//div//input[@type='number'])[last()]", data[i].age);
  
      // choose gender
      await setValueToInput("(//select[@formcontrolname='passengerGender'])[last()]", data[i].gender);
  
      // choose birth choice
      await setValueToInput("(//select[@formcontrolname='passengerBerthChoice'])[last()]", data[i].birthChoice);
  
    }
  
    // auto upgrade 
    await clickElm("//label[contains(text(),'Consider for Auto Upgradation')]");
  
    // pay through UPI
    await clickElm("//label[contains(text(),'UPI')]//p-radiobutton//div[@role='radio']");
  
  
    //click continue 
    await clickElm("//button[@type='submit' and contains(text(),'Continue')]");
  
    await autoFocus("//input[@id='captcha']");
  
    // Enter the captch manually after focus is made
  
    // click on BHIM and UPI button
    await clickElm("//span[contains(text(),'Multiple Payment Service')]");
  
    // pay using UPI
    await clickElm("//span[contains(text(),'cards') and contains(text(),'UPI') and contains(text(),'Paytm')]");
  
    // click pay & book button
    await clickElm("//button[@type='button' and contains(text(),'Pay & Book') and contains(@class,'hidden')]");
  
  }
  
  async function bookNow(trainName, bookingTime, trainStartTime, compartment) {
    let currentTime;
    while (true) {
      currentTime = new Date().toTimeString().split(' ')[0];
  
      if (currentTime >= bookingTime) {
        await clickElm(`//div[contains(text(),'${trainName}')]//span//strong[contains(text(),'${trainStartTime}')]//parent::span//parent::div//parent::div//parent::div//following-sibling::*//*[contains(text(),'${compartment}')]`)
        await delay(700);
        await clickElm("(//strong[contains(text(),'AVAILABLE')])[1]");
        await delay(700);
        await clickElm("//button[@type='button' and contains(text(),'Book Now') and not(contains(@class,'disable'))]");
        await delay(700);
        break;
      }
  
      console.log('retrying', currentTime);
      await delay(400);
    }
  
  }
  
  async function run() {
    await bookNow('EGMORE', '11:00:10', '23:55', 'Sleeper'); // trainName, bookingTime, trainStartTime, compartment
    await enterDetailsAndPay();
  }
  
  run()
  
  