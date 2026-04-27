<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\ValidationRule;

class SafePath implements ValidationRule
{
    protected array $forbiddenPatterns = [
        '..',
        '~',
        '%2e%2e',
        '%2e%2e%2f',
        '%2e%2e%5c',
        '%252e%252e',
        '%252e%252e%252f',
        '%252e%252e%255c',
    ];

    public function validate(string $attribute, mixed $value, \Closure $fail): void
    {
        $normalized = strtolower($value);

        foreach ($this->forbiddenPatterns as $pattern) {
            if (str_contains($normalized, $pattern)) {
                $fail("The {$attribute} field contains an invalid path sequence.");
                return;
            }
        }
    }
}