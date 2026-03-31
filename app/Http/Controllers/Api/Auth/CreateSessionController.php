<?php

namespace App\Http\Controllers\Api\Auth;

use App\Domain\Auth\Contracts\IUserRepository;
use App\Http\Controllers\Controller;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class CreateSessionController extends Controller
{
    public function __invoke(Request $request, IUserRepository $user_repository)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (Auth::check()) {
            return redirect()->intended('/home/dashboard');
        }

        $user = $user_repository->findByEmail($validated['email']);

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw new DomainException('Invalid credentials.');
        }

        Auth::login($user);

        return redirect()->intended('/home/dashboard');
    }
}
