<?php

namespace App\Http\Requests\Api\Projects;

use App\Rules\SafePath;
use Illuminate\Foundation\Http\FormRequest;

class ReceiveArtifactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'artifact'            => 'required|file|max:102400',
            'commit_sha'          => 'nullable|string|max:40',
            'commit_message'     => 'nullable|string|max:500',
            'triggered_by'       => 'nullable|string|max:255',
        ];
    }

    public function withValidator(\Illuminate\Validation\Validator $validator): void
    {
        $validator->after(function (\Illuminate\Validation\Validator $validator) {
            $file = $this->file('artifact');

            if (!$file) {
                return;
            }

            $fileSize = $file->getSize() ?: 0;
            $availableBytes = disk_free_space(storage_path());

            if ($availableBytes !== false && $fileSize > $availableBytes * 1024) {
                $validator->errors()->add('artifact', 'Insufficient disk space to store artifact.');
            }

            $zip = new \ZipArchive();
            $path = $file->getPathname();
            $result = $zip->open($path);

            if ($result !== true) {
                $validator->errors()->add('artifact', 'Invalid or corrupted ZIP file.');
                return;
            }

            if ($zip->numFiles === 0) {
                $zip->close();
                $validator->errors()->add('artifact', 'ZIP archive is empty or contains no valid entries.');
                return;
            }

            $zip->close();
        });
    }

    public function messages(): array
    {
        return [
            'artifact.max' => 'The artifact file size exceeds the maximum allowed size of :max kilobytes.',
        ];
    }
}