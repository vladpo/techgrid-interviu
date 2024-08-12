import { z } from 'zod';
export const max = 'max';
export const min = 'min';
export const needs = (compare, n) => (field) => `${field} needs to be ${compare} ${n} characters`;
export const required = (field) => `${field} is required`;
export const msg = (field) => (f) => f(field);
const fn = msg('First name');
const ln = msg('Last name');
const email = msg('Email');
export const ZPublicUser = z.object({
    id: z.optional(z.string()),
    firstName: z
        .string({ required_error: fn(required) })
        .min(2, fn(needs(min, 2)))
        .max(30, fn(needs(max, 30))),
    lastName: z
        .string({ required_error: ln(required) })
        .min(2, ln(needs(min, 2)))
        .max(30, ln(needs(max, 30))),
    email: z
        .string({ required_error: email(required) })
        .email('Invalid email address')
        .max(100, email(needs(max, 100)))
});
export var Currency;
(function (Currency) {
    Currency["USD"] = "USD";
    Currency["EUR"] = "EUR";
    Currency["GBP"] = "GBP";
})(Currency || (Currency = {}));
//# sourceMappingURL=index.js.map