
function Address(Province, City, Area, provinceList, defaultProvince, defaultCity, defaultArea){
	this.Province = Province;
	this.City = City;
	this.Area = Area;
	this.provinceList = provinceList || [];
	this.defaultProvince = defaultProvince || '';
	this.defaultCity = defaultCity || '';
	this.defaultArea = defaultArea || '';
	this._init();
}

Address.prototype = {
	construtor: Address,
	select: function (likeArr, str){
		for(var i = 0; i < likeArr.options.length; i++){
			if(likeArr.options[i].value == str){
				likeArr.selectedIndex = i;
				return;
			}
		}
	},
	addOption: function (likeArr, str, obj){
		var option = document.createElement("option");
		likeArr.options.add(option);
		option.innerHTML = str;
		option.value = str;
		option.obj = obj; 
	},
	changeCity: function(){
		this.Area.options.length = 0;
		if(this.City.selectedIndex == -1){
			return;
		};
		var item = this.City.options[this.City.selectedIndex].obj;
		for(var i = 0; i < item.areaList.length; i++){
			this.addOption(this.Area, item.areaList[i], null);
		}
		this.select(this.Area, this.defaultArea);
	},
	changeProvince: function(){
		this.City.options.length = 0;
		this.City.onchange = null;
		if(this.Province.selectedIndex == -1){
			return;
		};
		var item = this.Province.options[this.Province.selectedIndex].obj;
		for(var i = 0; i < item.cityList.length; i++){
			this.addOption(this.City, item.cityList[i].name, item.cityList[i]);
		}
		this.select(this.City, this.defaultCity);
		this.changeCity();

		this.City.onchange = this.changeCity;
	},
	_init: function (){
		for(var i = 0; i < this.provinceList.length; i++){
			this.addOption(this.Province, this.provinceList[i].name, this.provinceList[i]);
		}
		this.select(this.Province, this.defaultProvince);
		this.changeProvince();
		this.Province.onchange = this.changeProvince;
	}
}
