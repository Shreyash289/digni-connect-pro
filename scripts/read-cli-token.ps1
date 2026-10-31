# Reads the access token that `supabase login` stored in Windows Credential
# Manager, so scripts/fix-otp-templates.mjs can reuse it instead of asking for a
# second personal access token. The CLI has no "print my token" command, and it
# stores the value as a generic credential via the keyring it bundles.
$ErrorActionPreference = 'Stop'

Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class CredMan {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct CREDENTIAL {
        public uint Flags;
        public uint Type;
        public string TargetName;
        public string Comment;
        public long LastWritten;
        public uint CredentialBlobSize;
        public IntPtr CredentialBlob;
        public uint Persist;
        public uint AttributeCount;
        public IntPtr Attributes;
        public string TargetAlias;
        public string UserName;
    }
    [DllImport("advapi32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern bool CredRead(string target, uint type, uint flags, out IntPtr credential);
    [DllImport("advapi32.dll")]
    public static extern void CredFree(IntPtr buffer);

    public static byte[] Read(string target) {
        IntPtr ptr;
        if (!CredRead(target, 1, 0, out ptr)) return null;
        try {
            CREDENTIAL c = (CREDENTIAL)Marshal.PtrToStructure(ptr, typeof(CREDENTIAL));
            byte[] blob = new byte[c.CredentialBlobSize];
            if (c.CredentialBlobSize > 0) Marshal.Copy(c.CredentialBlob, blob, 0, (int)c.CredentialBlobSize);
            return blob;
        } finally { CredFree(ptr); }
    }
}
'@

$blob = [CredMan]::Read('Supabase CLI:supabase')
if ($null -eq $blob) {
    Write-Error 'No stored Supabase CLI credential. Run: npx supabase login'
    exit 1
}

# The blob may be UTF-8 or UTF-16LE depending on the keyring version; the token
# is ASCII either way, so take whichever decode yields a plausible token.
$utf8 = [System.Text.Encoding]::UTF8.GetString($blob)
$utf16 = [System.Text.Encoding]::Unicode.GetString($blob)
$token = if ($utf8 -match 'sbp_[A-Za-z0-9]+') { $Matches[0] } elseif ($utf16 -match 'sbp_[A-Za-z0-9]+') { $Matches[0] } else { $null }

if (-not $token) {
    Write-Error 'Stored credential did not contain a recognizable sbp_ token.'
    exit 1
}
Write-Output $token
