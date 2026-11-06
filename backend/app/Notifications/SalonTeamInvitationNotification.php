<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SalonTeamInvitationNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly string $salonName,
        public readonly string $invitationUrl,
        public readonly string $role,
        public readonly string $expiresAt,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('Invitation to join '.$this->salonName.' on TOVU')
            ->greeting('You have been invited to a salon team')
            ->line('The salon '.$this->salonName.' has invited you to join its TOVU team as '.$this->role.'.')
            ->action('Review invitation', $this->invitationUrl)
            ->line('This invitation expires on '.$this->expiresAt.'.')
            ->line('If you were not expecting this invitation, you can ignore this email.');
    }
}
