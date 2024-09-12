const { test, expect } = require('@playwright/test');

function generateRandomString(length) {
  return Math.random().toString(36).substring(2, 2 + length);
}

// Datos de Prueba Comunes
const randomstr = generateRandomString(10);
const MYURL = 'https://opencart.abstracta.us/index.php?route=account/register';
const FIRST_NAME_VALID = 'John';
const LAST_NAME_VALID = 'Doe';
const TELEPHONE_VALID = '1234567890';
const PASSWORD_VALID = 'Password123';
const PASSWORD_MISMATCH = 'Password456';
const EMAIL_INVALID = 'email@invalido';
const SHORT_PASSWORD = 'Pas';
const TELEPHONE_INVALID = '12';
const XSS_SCRIPT = '<script>alert("XSS")</script>';

test.describe('Pruebas de Registro de Usuario', () => {

  test('CP001 - Registro de Usuario con Datos Válidos', async ({ page }) => {
    const EMAIL_VALID = `john.doe${randomstr}@example.com`;
    await page.goto(MYURL);
    await page.fill('#input-firstname', FIRST_NAME_VALID);
    await page.fill('#input-lastname', LAST_NAME_VALID);
    await page.fill('#input-email', EMAIL_VALID);
    await page.fill('#input-telephone', TELEPHONE_VALID);
    await page.fill('#input-password', PASSWORD_VALID);
    await page.fill('#input-confirm', PASSWORD_VALID);
    await page.check('input[name="agree"]');
    await page.click('input[value="Continue"]');
    await expect(page).toHaveURL(/.*success/);
  });

  test('CP002 - Intento de Registro con Campos Vacíos', async ({ page }) => {
    await page.goto(MYURL);
    await page.click('input[type="submit"]');
    const errorMessages = await page.locator('.text-danger');
    console.log(await errorMessages.count());
    await expect(errorMessages).toHaveCount(5); // Ajusta según los campos requeridos
  });

  test('CP003 - Registro con Formato de Email Inválido', async ({ page }) => {
    await page.goto(MYURL);
    await page.fill('#input-firstname', FIRST_NAME_VALID);
    await page.fill('#input-lastname', LAST_NAME_VALID);
    await page.fill('#input-email', EMAIL_INVALID);
    await page.fill('#input-telephone', TELEPHONE_VALID);
    await page.fill('#input-password', PASSWORD_VALID);
    await page.fill('#input-confirm', PASSWORD_VALID);
    await page.check('input[name="agree"]');
    await page.click('input[type="submit"]');
    const emailError = await page.locator('#input-email + .text-danger');
    await expect(emailError).toHaveText('E-Mail Address does not appear to be valid!');
  });

  test('CP004 - Contraseñas que no Coinciden', async ({ page }) => {
    const EMAIL_VALID = `john.doe${randomstr}@example.com`;
    await page.goto(MYURL);
    await page.fill('#input-firstname', FIRST_NAME_VALID);
    await page.fill('#input-lastname', LAST_NAME_VALID);
    await page.fill('#input-email', EMAIL_VALID);
    await page.fill('#input-telephone', TELEPHONE_VALID);
    await page.fill('#input-password', PASSWORD_VALID);
    await page.fill('#input-confirm', PASSWORD_MISMATCH);
    await page.check('input[name="agree"]');
    await page.click('input[value="Continue"]');
    await expect(page.locator('text="Password confirmation does not match password!"')).toBeVisible();
  });

  test('CP005 - Registro sin Aceptar la Política de Privacidad', async ({ page }) => {
    const EMAIL_VALID = `john.doe${randomstr}@example.com`;
    await page.goto(MYURL);
    await page.fill('#input-firstname', FIRST_NAME_VALID);
    await page.fill('#input-lastname', LAST_NAME_VALID);
    await page.fill('#input-email', EMAIL_VALID);
    await page.fill('#input-telephone', TELEPHONE_VALID);
    await page.fill('#input-password', PASSWORD_VALID);
    await page.fill('#input-confirm', PASSWORD_VALID);
    await page.click('input[value="Continue"]');
    await expect(page.locator('text="Warning: You must agree to the Privacy Policy!"')).toBeVisible();
  });

  test('CP006 - Suscripción al Newsletter', async ({ page }) => {
    const EMAIL_VALID = `john.doe${randomstr}-new@example.com`;
    await page.goto(MYURL);
    await page.fill('#input-firstname', FIRST_NAME_VALID);
    await page.fill('#input-lastname', LAST_NAME_VALID);
    await page.fill('#input-email', EMAIL_VALID);
    await page.fill('#input-telephone', TELEPHONE_VALID);
    await page.fill('#input-password', PASSWORD_VALID);
    await page.fill('#input-confirm', PASSWORD_VALID);
    await page.check('input[name="newsletter"]');
    await page.check('input[name="agree"]');
    await page.click('input[value="Continue"]');
    await expect(page).toHaveURL(/.*success/);
  });

  test('CP007 - No Suscripción al Newsletter', async ({ page }) => {
    const EMAIL_VALID = `john.doe${randomstr}-nonew@example.com`;
    await page.goto(MYURL);
    await page.fill('#input-firstname', FIRST_NAME_VALID);
    await page.fill('#input-lastname', LAST_NAME_VALID);
    await page.fill('#input-email', EMAIL_VALID);
    await page.fill('#input-telephone', TELEPHONE_VALID);
    await page.fill('#input-password', PASSWORD_VALID);
    await page.fill('#input-confirm', PASSWORD_VALID);
    await page.uncheck('input[name="newsletter"]');
    await page.check('input[name="agree"]');
    await page.click('input[value="Continue"]');
    await expect(page).toHaveURL(/.*success/);
  });

  test('CP008 - Validación de Longitud de Contraseña', async ({ page }) => {
    const EMAIL_VALID = `john.doe${randomstr}@example.com`;
    await page.goto(MYURL);
    await page.fill('#input-firstname', FIRST_NAME_VALID);
    await page.fill('#input-lastname', LAST_NAME_VALID);
    await page.fill('#input-email', EMAIL_VALID);
    await page.fill('#input-telephone', TELEPHONE_VALID);
    await page.fill('#input-password', SHORT_PASSWORD);
    await page.fill('#input-confirm', SHORT_PASSWORD);
    await page.check('input[name="agree"]');
    await page.click('input[value="Continue"]');

    const errorMessages = await page.locator('.text-danger');
    console.log(await errorMessages.count());
    await expect(errorMessages).toHaveCount(1);
  });

  test('CP009 - Validación de Campo de Teléfono', async ({ page }) => {
    const EMAIL_VALID = `john.doe${randomstr}@example.com`;
    await page.goto(MYURL);
    await page.fill('#input-firstname', FIRST_NAME_VALID);
    await page.fill('#input-lastname', LAST_NAME_VALID);
    await page.fill('#input-email', EMAIL_VALID);
    await page.fill('#input-telephone', TELEPHONE_INVALID);
    await page.fill('#input-password', PASSWORD_VALID);
    await page.fill('#input-confirm', PASSWORD_VALID);
    await page.check('input[name="agree"]');
    await page.click('input[value="Continue"]');
    
    const errorMessages = await page.locator('.text-danger');
    console.log(await errorMessages.count());
    await expect(errorMessages).toHaveCount(1);
  });

  test('CP010 - Navegación a la Página de Login', async ({ page }) => {
    await page.goto(MYURL);
    await page.click('text="login page"');
    await expect(page).toHaveURL(/.*login/); // Ajusta la URL según el comportamiento esperado
  });

  test('CP011 - Marcado de Campo Requerido con Estilo CSS', async ({ page }) => {
    await page.goto(MYURL);
    await page.click('input[value="Continue"]');

    const errorMessages = await page.locator('.text-danger');
    console.log(await errorMessages.count());
    await expect(errorMessages).toHaveCount(5);
  });

});