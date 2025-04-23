// src/services/stripe.js
import { loadStripe } from '@stripe/stripe-js';

// Подставь здесь свой PublishableKey из appsettings.json (Live или Test)
const stripePromise = loadStripe(pk_test_51RGtKZHVM2mOKSPtxaySoVw2MjqGAg4lFJR1p5tLTK1SA6Qa2QovIdtq9TVXRXayC5aYzf4QJ9ubUXtNNx6cLpjO00o4n9IXls');

export default stripePromise;
