/**
 * Guest flow — happy path
 *
 * Covers: WelcomeScreen → name/age form → Supabase anonymous auth →
 * student_profile creation → HomeScreen
 *
 * Requires a booted iPhone 17 Pro simulator and a built debug binary.
 * Run: npm run e2e:build && npm run e2e
 */

describe('Guest flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('shows the welcome screen on first launch', async () => {
    await expect(element(by.text('Mythiko Chorio'))).toBeVisible();
    await expect(element(by.label('Play as Guest'))).toBeVisible();
  });

  it('shows the name/age form when Play as Guest is tapped', async () => {
    await element(by.label('Play as Guest')).tap();

    await expect(element(by.label('Your name'))).toBeVisible();
    await expect(element(by.label('Your age'))).toBeVisible();
    await expect(element(by.label('Start playing'))).toBeVisible();
  });

  it('shows a validation error when name is empty', async () => {
    await element(by.label('Play as Guest')).tap();
    await element(by.label('Start playing')).tap();

    await expect(element(by.text('Please enter your name.'))).toBeVisible();
  });

  it('shows a validation error when age is out of range', async () => {
    await element(by.label('Play as Guest')).tap();
    await element(by.label('Your name')).typeText('Alex');
    await element(by.label('Your age')).typeText('2');
    await element(by.label('Start playing')).tap();

    await expect(
      element(by.text('Please enter your age (3–18).')),
    ).toBeVisible();
  });

  it('navigates to the island map after a valid name and age are submitted', async () => {
    await element(by.label('Play as Guest')).tap();
    await element(by.label('Your name')).typeText('Alex');
    await element(by.label('Your age')).typeText('8');
    await element(by.label('Start playing')).tap();

    // Waits for Supabase anonymous auth + profile creation
    await waitFor(element(by.text('Island Map')))
      .toBeVisible()
      .withTimeout(10000);

    await expect(element(by.text('Γεια σου, Alex!'))).toBeVisible();
  });

  it('skips the welcome screen on relaunch if a session is already stored', async () => {
    // Complete guest sign-in
    await element(by.label('Play as Guest')).tap();
    await element(by.label('Your name')).typeText('Alex');
    await element(by.label('Your age')).typeText('8');
    await element(by.label('Start playing')).tap();
    await waitFor(element(by.text('Island Map')))
      .toBeVisible()
      .withTimeout(10000);

    // Relaunch without clearing storage — session should be restored
    await device.launchApp({ newInstance: false });

    await waitFor(element(by.text('Island Map')))
      .toBeVisible()
      .withTimeout(10000);
  });
});
