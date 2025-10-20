type RgbColor =
{
    red: number;
    green: number;
    blue: number
}

type ColorSuccess = { ok: true; rgbColor: RgbColor };
type Failure = { ok: false; error: string };

export type ColorResult = ColorSuccess | Failure;

export async function   changeBackgroundColor(red: number, green: number, blue: number): Promise<ColorResult>
{ 
    try
    {
        const res = await fetch('/api/user/menu/color', 
        {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ red, green, blue }),
        });
        const data = await res.json();
        if (res.ok)
        {
            console.log("Background color changed");
            return ({ ok: true, rgbColor: data.rgbColor });
        }
        return ({ ok:false, error: data.message });
    }
    catch (err)
    { 
        return ({ ok:false, error: "Network error" });
    }
}

export async function   getBackgroundColor(): Promise<ColorResult>
{
    try
    {
        const res = await fetch('/api/user/menu/color', 
        {
            method: 'GET',
            credentials: 'include',
        });
        const data = await res.json();
        if (res.ok)
        {
            console.log("Background color changed");
            return ({ ok: true, rgbColor: data.rgbColor });
        }
        return ({ ok:false, error: data.message });
    }
    catch (err)
    {
        return ({ ok:false, error: "Network error" });
    }
}