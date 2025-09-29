/*export function getSecret(name)
{
	try 
    {
		const key = fs.readFileSync(`/run/secrets/${name}`, 'utf8').trim();
		return (key);
	}
    catch (error)
    {
		console.log("❌ Critical error : Unable to read secret ", name);
		process.exit(0);
	}
}*/