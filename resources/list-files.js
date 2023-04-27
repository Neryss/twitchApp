const fs = require('fs');

function	test(entry) {
	fs.readFile('nox.json', 'utf-8', function readFileCallback(err, data){
		if (err){
			console.log(err);
		} else {
		obj = JSON.parse(data);
		for (var i = 0; i < obj.length; i++)
		{
			if (obj[i].name == entry.name)
			{
				console.log(`file ${entry.name} already exists`);
				return;
			}
		}
		obj.push(entry);
		json = JSON.stringify(obj, null, 4);
		fs.writeFile('nox.json', json, 'utf-8', () => {
			if (err)
				console.error(err);
		});
	}});
}

function main() {
	const files = fs.readdirSync('./photos');
	var json = [];
	var exists = false;
	if (fs.existsSync('./nox.json'))
		exists = true
	for (var i = 0; i < files.length; i++)
	{
		var data = {
			name: files[i],
			sent: false,
			id: i
		};
		json[i] = data;
		if (exists)
			test(json[i]);
	}
	if (!exists)
		fs.writeFileSync('nox.json', JSON.stringify(json, null, 4), 'utf-8');
	return (0);
}

main();