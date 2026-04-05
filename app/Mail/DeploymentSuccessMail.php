<?php

namespace App\Mail;

use App\Infrastructure\Persistence\Models\Deployment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DeploymentSuccessMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Deployment $deployment) {}

    public function envelope(): Envelope
    {
        $project = $this->deployment->project;

        return new Envelope(
            subject: "Deployment Successful - {$project->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.deployment-success',
        );
    }
}
