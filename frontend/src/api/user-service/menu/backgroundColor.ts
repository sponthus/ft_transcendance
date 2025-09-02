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
    const token = localStorage.getItem("token");
    if (!token)
        return {ok: false, error: "No token found"};
    const res = await fetch('/api/user/menu/color', 
    {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ red, green, blue }),
    });
    const data = await res.json();
    if (res.ok)
    {
        console.log("Background color changed");
        return ({ ok: true, rgbColor: data.rgbColor });
    }
    return ({ ok:false, error: data.error });
}

export async function   getBackgroundColor(): Promise<ColorResult>
{
    const token = localStorage.getItem("token");
    if (!token)
        return {ok: false, error: "No token found"};
    const res = await fetch('/api/user/menu/color', 
    {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok)
    {
        console.log("Background color changed");
        return ({ ok: true, rgbColor: data.rgbColor });
    }
    return ({ ok:false, error: data.error });
}