mui.init({
    swipeBack: false,
    pullRefresh: {
        container: '#pullrefresh',
        down: {
            callback: pulldownRefresh
        },
    }
});
var setList;
function pulldownRefresh() {//下拉刷新任务
    refreshTime=setTimeout(function() { 
    	setList.setSenceData();
        mui('#pullrefresh').pullRefresh().endPulldownToRefresh(); //refresh completed                       
    }, 1500);       
} 
(function($) {
	$.ready(function(){
	//处理view的后退与webview后退
	var viewApi = $('#newTask').view({
		defaultPage: '#setting',
		forbidden:true//补丁 禁止左右拖动
	});
	//初始化单页的区域滚动
	var view = viewApi.view;
	$('.mui-scroll-wrapper').scroll();
	sessionStorage.removeItem('delayAll');//清空		
	var oldBack = $.back;
	var btns = $('.btn');
	var timeAll=[],saveAll={},jobInfo={},bgColor=[],_copyRadio={},generalRadio={};//timeAll储存时间数组,saveAll储存星期和时间的对象,jobInfo储存任务的对象,_copyRadio储存执行情景模式的radio索引,generalRadio储存执行情景模式选择的索引值
	var SweekBtn=document.getElementById("SweekBtn");
	var parameters=0;
	var stekVal=$('.week')[0].value;
	var stekVal_1="",stekVal_2="",stekVal_3="",stekVal_4="",stekVal_5="",stekVal_6="",stekVal_7="";
	var forweek=document.getElementById("forweek");
	var miniAjax=function(options) {
		var request = new XMLHttpRequest();
		var type=options.type||"GET";
		var url=options.url;
		var success=options.success||undefined;
		var error=options.error||undefined;
		if (!url) {
			return;
		}
		request.open(type,url,true);
		request.onload = function() {
		  if (request.status >= 200 && request.status < 400) {// Success!
		    var resp = request.responseText;
		    if (success) {
		    	success();
		    }
		  }else {
		    // We reached our target server, but it returned an error
			    if (error) {
			    	error();
			    }
		  }
		};
		request.onerror = function() {
		  // There was a connection error of some sort
	  		if (error) {
		    	error();
		    }
		};
		request.send();
	};
	var rangeList = document.querySelectorAll('input[type="range"]');
		var Inarr=function(argument){//扩展数组对象，查找是否存在某元素
		for (var i = 0; i <this.length; i++) {
			if (this[i]==argument) {
				return true;
			}
		}
		return false;
	};
	var Hasarr=function(argument){//扩展数组对象，查找某元素存在的位置
		var size=new Array();
		for (var i = 0; i <this.length; i++) {
			if (this[i]==argument) {
				size.push(i);
			}else{
				continue;
			}
		}
		return size;
	};
	NodeList.prototype.forEach=Array.prototype.forEach;//扩展NodeList数组
	var SetWeek=function(check,value,index){//星期选择器
		var _copy;
		var _copyTime;
	    this.check=check;
	    this.value=value;
	    this.index=index;
	    this.setValue=function(){//设置星期的值
	      	if (this.check){//判断是否选中，并且把值赋给数组保存
	        	if (saveAll) {
	        		saveAll[this.value]=timeAll;
	        	}
	        		bgColor[this.index]=1;
	        }else if (!this.check){
	        	delete saveAll[this.value];
	        	bgColor[this.index]=0;
	        }
	    };
	    this.checkInvalid=function(callback,parameters){//回调和索引
	        if (!Inarr.call(bgColor,1)) {
	            $('.week')[0].value="";
	            forweek.innerHTML="";
	            $.alert('请选择正确的星期', '');
	            return;
	        }
	        else{
	        	this.callback(parameters);//执行回调
	        }
	    };
	    this.callback=function(parameters){//选中后插入到input
		    stek=Hasarr.call(bgColor,1);
		    $('.week')[parameters].value="";//必须清空文本框!
		    var stekVal="";
		    var stekVal_1="",stekVal_2="",stekVal_3="",stekVal_4="",stekVal_5="",stekVal_6="",stekVal_7="";
	        for (var i = 0; i<stek.length; i++) {
	            var l=stek[i];
	            switch(l){
	                case 0:stekVal_1="一";break;
	                case 1:stekVal_2="二";break;
	                case 2:stekVal_3="三";break;
	                case 3:stekVal_4="四";break;
	                case 4:stekVal_5="五";break;
	                case 5:stekVal_6="六";break;
	                case 6:stekVal_7="日";break;
	                default:return;
	            }
	    	};
			stekVal=stekVal_1+stekVal_2+stekVal_3+stekVal_4+stekVal_5+stekVal_6+stekVal_7;
	        function rtrim(str){  //删除右边的空格
	            return str.replace(/(\s*$)/g,"");
	        }
	        var copyStekVal="";
	        var $str="周"+stekVal_1+" "+stekVal_2+" "+stekVal_3+" "+stekVal_4+" "+stekVal_5+" "+stekVal_6+" "+stekVal_7;
	        var $arr=stekVal.split("");
	        $arr.forEach(function(currentValue){
	            copyStekVal+=currentValue+" ";
	        });
	        copyStekVal="周"+rtrim(copyStekVal)
	        if (stekVal=="一二三四五") {
	        	$('.week')[parameters].value='工作日';
	        	forweek.innerHTML="工作日";
	        }else if (copyStekVal=="一二三四五六日") {
	        	$('.week')[parameters].value='每天';
	        	forweek.innerHTML="每天";
	        }else if (copyStekVal=="六日") {
	        	$('.week')[parameters].value='周末';
	        	forweek.innerHTML="周末";
	        }else{
	        	$('.week')[parameters].value=copyStekVal+" ";
	        	forweek.innerHTML=copyStekVal+" ";
	        }
		}
		this.setArr=function(){//转换成cron表达式
	        	var str="0 min h ? * w";//秒 分 时 天 月 周(没有设定秒,天,月统一用*)
	        	var startArr=str.split(' '),endArr=str.split(' ');
	        	if (timeAll.length==2) {
		            startArr[1]=timeAll[0].minute,endArr[1]=timeAll[1].minute;
		            startArr[2]=timeAll[0].hour,endArr[2]=timeAll[1].hour;
		            startArr[5]='',endArr[5]='';
		        	for (week in saveAll) {
		            	startArr[5]+=week+',';
		            	endArr[5]+=week+',';
		        	}
		            startArr[5]=startArr[5].slice(0,-1);
		            endArr[5]=endArr[5].slice(0,-1);
		            var startStr=startArr.join(' ');
		            var endStr=endArr.join(' ');
		            SetTask.getItem(startStr,endStr);	        		
	        	}else{
		            startArr[1]=timeAll[0].minute;
		            startArr[2]=timeAll[0].hour;;
		            startArr[5]='';
		        	for (week in saveAll) {
		            	startArr[5]+=week+',';
		        	}
		            startArr[5]=startArr[5].slice(0,-1);
		            var startStr=startArr.join(' ');
		            SetTask.getItem(startStr);	        		
	        	}
	           	this._copyTime();
		}
	   	this._copyTime=function(){//设置成功插入到首页
		   		var star=timeAll[0].hour+':'+timeAll[0].minute;
		   		var end=timeAll[1].hour+':'+timeAll[1].minute;
	   			document.getElementById('setting').querySelector('.list0').innerHTML='<a href="#notifications" class="mui-navigate-right"><span class="mui-icon iconfont icon-timing"></span>请选择时间</a><ul class="mui-table-view"><li class="mui-table-view-cell" data-select='+1+'><div class="mui-input-row mui-radio"><label class="mui-ellipsis"></label></div></li></ul>'
	   			document.querySelector('.list0').querySelector("label.mui-ellipsis").innerHTML=$('.week')[parameters].value+star+"-"+end+"有效";
	   	}
	}
	var SetTask={//任务类
		checkObj:function(obj){//检查对象的是否含有某个值
			for(var k in obj){
	  			if(!obj[k]){
	    			var names=["false",k];//存入数组，判断当前为false的元素位置
	    			return names;
	    		}
	    	}
	    	return true;
		},
	    isEmpty:function(obj){//检查对象是否为空
	        for(var k in obj){
	        	return false;
	        }
	        return true;
	    },
	   checkJob:function(){//检查任务
	        var ls='go';
	        var go={go0:false,go1:false,go2:false};
	        var checkID=[];//元素选择的索引
	        var taskNameValue=document.getElementById('taskName').value;
	        var radios=document.querySelectorAll('.list').length;//选项卡个数(自己设置)
	        //var reg=/[\u4e00-\u9fa5]/;//设置中文的正则表达式
	        for (var i = 0; i <radios; i++) {
	            if (i>2) {go[ls+i]=false;}
	        }   
	        for (var i = 0; i < radios; i++) {//检查.list下是否含有label元素,如果不存在，提示用户
	        	var goIndex=ls+i;
	        	if(!document.querySelectorAll('.list')[i].querySelector('.mui-table-view-cell')){
	        		var listName="";
	        		if (i==0) {
	        			listName="请选择时间";
	        		}else if (i==1) {
	        			listName="请选择触发源";
	        		}else if (i>=2) {
	        			listName="请选择情景模式";
	        		}
	        		$.alert(listName);
	        		return;
	        	}else{
	            	var _select=document.querySelectorAll('.list')[i].querySelector('.mui-table-view-cell').dataset.select;
	            	if (_select) {
	            		go[goIndex]=true;
	            		checkID.push(_select);
	            	}else{
	            		console.log(i)
	            	}
	        	}
	        }               
	        // if (checkID[0]!=0&&timeAll[0]==null&&timeAll[1]==null) {
	        // 	$.alert('时间不能为空');return;
	        // }
	        // if (checkID[0]!=0&&SetTask.isEmpty(saveAll)) {
	        // 	$.alert('时间和星期不能为空','');return;
	        // }
	        // if (checkID[0]==2&&timeAll.length!=2){
	        // 	$.alert('时间不能为空');return;
	        // }
	        // if(SetTask.checkObj(go)[0]=="false"){
	        // 	if (SetTask.checkObj(go)[1]>=4) {return}
	        // 	var listName="第"+(Number(SetTask.checkObj(go)[1].slice(2))+1)+"个选项卡不能为空";
	        // 	$.alert('选项不能为空',listName);return;}
	        // else{
	        	if (taskNameValue==''){
	        		$.alert('任务名称不能为空','');
	        		return;
	        	}
	        	//else if(!reg.test(taskNameValue)){$.alert('请输入中文');return;}
	        	else{
	        		SetTask.setTask(checkID,taskNameValue);
	        	}        
	        // }
	        // if (taskNameValue==''){$.alert('任务名称不能为空','');return}
	   },
	   getItem:function(startArr,endArr){//设置cronExpressionArray
	   		if (!endArr) {
	   			this.timeArrgroup=[startArr];	   			
	   		}else{
				this.timeArrgroup=[startArr,endArr];
	   		}
	   },
	   setTask:function(argument,taskNameValue){//设置任务
	   		var setting=document.getElementById('setting');
	    	var sourcesence={//触发源
	    		sceneId:setting.querySelector('.mui-table-view-cell.list1').querySelector('.mui-table-view-cell').dataset.id,//触发源ID
	    		sceneName:setting.querySelector('.mui-table-view-cell.list1').querySelector('.mui-table-view-cell').querySelector('.mui-ellipsis').dataset.namedevice,//触发源名称
	    		idDevice:setting.querySelector('.mui-table-view-cell.list1').querySelector('.mui-table-view-cell').querySelector('.mui-input-row.mui-radio').dataset.iddevice,//触发源设备值
	    		idGateway:setting.querySelector('.mui-table-view-cell.list1').querySelector('.mui-table-view-cell').querySelector('.mui-input-row.mui-radio').dataset.idgateway//触发源网关          
	    	}
	        var dosence={//就执行情景模式
	            	groupId:setting.querySelector('.mui-table-view-cell.list2').querySelector('.mui-table-view-cell').dataset.idgroup,//情景模式idGroup
	            	DosceneId:setting.querySelector('.mui-table-view-cell.list2').querySelector('.mui-table-view-cell').querySelector('.mui-input-row.mui-radio').dataset.idscene,//情景模式idScene 
	            	DosceneName:setting.querySelector('.mui-table-view-cell.list2').querySelector('.mui-table-view-cell').querySelector('.mui-input-row.mui-radio').querySelector('label').innerText//情景模式任务名称              
	        };
			var doSenceGroup=[{'num':1,'idgroup':dosence.groupId,'sceneId':dosence.DosceneId,"sceneName":dosence.DosceneName,delayTime:""}],url;
	        var UserMsg=$interface.SmartJob.getUserMsg();
	        var week=['SUN','MON','TUE','WED','THU','FRI','SAT'];  
	        if (argument.length>3){
	        	argument.forEach(function(currentValue,index,array){
	        		if (index>2) {
	        			var num=index-1;
			            var delaysence={//再执行情景模式
			                delayGroupId:setting.querySelectorAll('.list')[index].querySelector('.mui-table-view-cell').dataset.idgroup,//再执行情景模式idGroup
			                delaySceneId:setting.querySelectorAll('.list')[index].querySelector('.mui-input-row.mui-radio').dataset.idscene,//再执行情景模式idScene
			                delaySceneName:setting.querySelectorAll('.list')[index].querySelector('.mui-input-row.mui-radio').querySelector('label span').innerText//再执行情景模式任务名称
			            };
	            		doSenceGroup.push({'num':num,'idgroup':delaysence.delayGroupId,'sceneId':delaysence.delaySceneId,"sceneName":delaysence.delaySceneName,delayTime:""});
	        		}	
	        	})
	    	}
	    	try{
	    		var delayAll=JSON.parse(sessionStorage.getItem('delayAll'));//延时任务
	    		var delayArr=delayAll.delayArr;
		    	if(!SetTask.isEmpty(delayAll)||delayArr.length!==0){
		    		doSenceGroup.forEach(function(currentValue,index,array){
		    			if (currentValue.num==1) {return;}
		    			for(var i=0,len=delayArr.length; i<len; i++){
		    				if (currentValue.num==delayArr[i].num) {
			    				currentValue.delayTime=delayArr[i].delayTime;	    				
			    			}
		    			}			        			      			
		    		})
		    		delayArr.forEach(function(currentValue,index,array) {//删除多余的延时任务
		    			if (!doSenceGroup[index]) {
		    				delayArr.splice(index,1);
		    				delayAll.delayArr=delayArr;
		    				sessionStorage.setItem('delayAll',JSON.stringify(delayAll))
		    			} 
		    		})
		    	}	    		
	    	}catch(e){}
	    	if (argument[0]==0){
	       		jobInfo={
	                idFamily:UserMsg.idFamily,
	                userName:UserMsg.username,
	                req_token:UserMsg.token,       			
	       			jobName:taskNameValue,
	       			jobState:'NORMAL',
	       			jobType:'SceneRelated',
	       			triggerType:'cronTrigger',
	       			cronExpressionArray:['* * * * * ?'],
	       			sourceScene:{'idDevice':sourcesence.idDevice,"deviceName":sourcesence.sceneName},
	       			doScene:doSenceGroup,
	       			validity:"everyDay",
	       			idGateway:sourcesence.idGateway,
	       			isBetweenConfigTime:true
	       		}
	    	}else{
	    		if(!this.timeArrgroup){
	    			var setweek5=new SetWeek();
	    			setweek5.setArr();//设置this.timeArrgroup(cron表达式)
	    			if (!this.timeArrgroup) {
	    				$.alert('请选择指定时间段');
	    				return;
	    			}	    			
	    		}
           		jobInfo={	           			
	                idFamily:UserMsg.idFamily,
	                userName:UserMsg.username,
	                req_token:UserMsg.token, 
				    jobName: taskNameValue,
				    jobState: "NORMAL",
				    jobType: "SceneRelated",
				    triggerType:"cronTrigger",
				    cronExpressionArray:this.timeArrgroup,
				    sourceScene:{'idDevice':sourcesence.idDevice,"deviceName":sourcesence.sceneName},    
				    doScene:doSenceGroup,
				   	validity:"custom",
				   	idGateway:sourcesence.idGateway,
				   	isBetweenConfigTime:false
           		}
		        if (timeAll&&saveAll.hasOwnProperty(week[new Date().getDay()])) {
					var nowHour=new Date().getHours();
					var nowMinute=new Date().getMinutes();
					if (nowHour>=timeAll[0].hour&&nowHour<=timeAll[1].hour) {
						if (nowMinute>=timeAll[0].minute) {
							if (nowMinute<=timeAll[1].minute&&nowHour==timeAll[1].hour) {
								jobInfo.isBetweenConfigTime=true;
							}else if(nowHour<timeAll[1].hour){
								jobInfo.isBetweenConfigTime=true;
							}						
						}
					}
		        } 	
           	}
           	var paramData = JSON.parse(setting.querySelector('#parameters').dataset.parameters); 
	    	for(var param in paramData){
	    		jobInfo["sourceScene"][param] = paramData[param];
	    	}  
           	console.log(jobInfo,saveAll,timeAll);
 			if (location.href.split('/')[location.href.split('/').length-1].indexOf('app.html')!=-1) {
 				url=$interface.addSceneRelateJob();
 			}else if(location.href.split('/')[location.href.split('/').length-1].indexOf('edit.html')!=-1){
 				url=$interface.updateSceneRelateJob();
 			}

 			document.getElementById('savaTask').disabled=true;
			Zepto.ajax({
				url:url,	
	            type: 'POST',	                        
				data: JSON.stringify(jobInfo),
	            dataType:"json",				
	            success: function(data) {               
                    var $message=data.message;
                    var $status=data.status;
                    if ($status=='success') {
                        jqEffect.fadeIn(document.querySelector('.Cmui-popup.Cmui-popup-in'));
                        sessionStorage.setItem("isTap",JSON.stringify({'#item1mobile':{'state':false,'times':'0'},'#item2mobile':{'state':false,'times':'0'},'now':'#item1mobile'}));                        
                        setTimeout(function(argument) {
                           window.location.href="smarttask.html";
                        },1000) 
                    }else{
                        if ($message=="任务已存在") {
                            mui.alert('任务名称唯一,不可重复');
                            document.getElementById('savaTask').disabled=false;
                            return;
                        }else{
	                        document.querySelector('.Cmui-popup.Cmui-popup-in').querySelector('pre').innerHTML=$message;
	                        jqEffect.fadeIn(document.querySelector('.Cmui-popup.Cmui-popup-in'));
	                        sessionStorage.setItem("isTap",JSON.stringify({'#item1mobile':{'state':false,'times':'0'},'#item2mobile':{'state':false,'times':'0'},'now':'#item1mobile'}));                        
	                        setTimeout(function(argument) {
	                           window.location.href="smarttask.html";
	                        },1000)                      		
                    	}                       
                    }
                },
                error:function(xhr,type,errorThrown){
                    document.querySelector('.Cmui-popup.Cmui-popup-in').querySelector('pre').innerHTML="添加任务失败";
                    jqEffect.fadeIn(document.querySelector('.Cmui-popup.Cmui-popup-in'));
                        sessionStorage.setItem("isTap",JSON.stringify({'#item1mobile':{'state':false,'times':'0'},'#item2mobile':{'state':false,'times':'0'},'now':'#item1mobile'}));                    
                    setTimeout(function(argument) {
                       window.location.href="smarttask.html";
                    },1000)  
                }
	        });						       
	    }
	};
	setList={//设置触发源和情景模式的数据
	    setSenceData:function(){//填充进HTML
	    	//清空触发源和情景模式的数据，防止下拉刷新时重复数据
	    	document.getElementById('privacy').querySelector('.mui-table-view').innerHTML = "";
	    	document.getElementById('general').querySelector('.mui-table-view').innerHTML = "";

	    	try{
		     	Zepto.ajax({//触发源
		     		url:$interface.getSenseDeviceList(),
		     		type:'get',
		     		async:false,
		     		success:function(data) {//返回的是json对象
		     			var trigger=data.data;
		     			//储存设备参数信息
		     			var parameterData = new Object();
		     			for(var i=0,len=trigger.length; i<len; i++){
		     				parameterData[trigger[i].idDevice] = trigger[i].deviceParam;
		     			}
		     			sessionStorage.setItem("parameterData", JSON.stringify(parameterData));
				    	if (!trigger||trigger.length==0) {
				    		document.getElementById('privacy').querySelector('.mui-table-view').innerHTML+='<li class="mui-table-view-cell" style="color:#f00">该家庭没有添加设备</li>';                
				    	}else{
					    	var str2='<li class="mui-table-view-cell">,,,</div>,</li>';//触发源
					    	var arr2=str2.split(',');
					        trigger.forEach(function(element,index,array){//触发源
					            arr2[0]="<li class='mui-table-view-cell'"+" "+'data-id='+element.id+" "+'data-select='+index+'>';
					            arr2[1]="<div class='mui-input-row mui-radio'"+" "+'data-idGateway='+element.idGateway+" "+'data-idDevice='+element.idDevice+'>';
					            arr2[2]='<div class="mui-col-xs-12">'+"<label class='mui-ellipsis' data-nameDevice="+element.nameDevice +'>'+'名称:'+element.nameDevice+'</label>'+'<label><h5 class="mui-ellipsis" data-typeDevice='+element.typeDevice+' data-device-param='+element.deviceParam+'>'+'设备类型:'+element.typeDevice+'</h5></label>'+'<input name="radio1" type="radio" data-type-Device="'+element.typeDevice+'">'+'</div>';str2=arr2.join('');
					            document.getElementById('privacy').querySelector('.mui-table-view').innerHTML+=str2;
					        });
					        
					        Zepto.ajax({
								url:$interface.getJobByJobType()+'&jobType=SceneRelateJob',
								type:'GET',
								dataType: 'json',
								success:function(data){
									if (sessionStorage.getItem('nowSceneRelateJob')) {
										var SceneRelateJobIddevice=JSON.parse(sessionStorage.getItem('nowSceneRelateJob')).idDevice;					
									}
									if (data.length!==0) {
						        		sessionStorage.setItem('SceneRelateJob',JSON.stringify(data));
						        		data.forEach(function(current,index){			    		
								    		var isSelectSceneRelateJobIddevice=current.jobDataMap.sourceScene.idDevice;			    																
								    		var isSelect='.mui-input-row.mui-radio[data-iddevice='+'"'+isSelectSceneRelateJobIddevice+'"'+']';
							    			try{
					   							document.getElementById('privacy').querySelector(isSelect).querySelector("input[name='radio1']").disabled=true;	
					   							document.getElementById('privacy').querySelector(isSelect).querySelector("input[name='radio1']:checked").disabled=false;				    				
							    			}catch(e){
							    				return;
							    			}			    		
										})						
									}
									if(window.location.href.indexOf("edit")>=0){
										//编辑页面添加感应设备参数

								      	var SceneRelateJob=JSON.parse(sessionStorage.getItem('SceneRelateJob'));
								      	var nowSelect=JSON.parse(sessionStorage.getItem('nowSceneRelateJob'));
								      	var nowSelectSceneRelateJob=SceneRelateJob[nowSelect.index];
								      	var jobName=nowSelectSceneRelateJob.jobName||nowSelect.jobName; 
								   
							      		var SceneRelateJobIddevice=nowSelectSceneRelateJob.jobDataMap.sourceScene.idDevice||nowSelect.idDevice; 
				            			var _parameters = nowSelectSceneRelateJob.jobDataMap.sourceScene;
				            			var _parameterDataStr = parameterData[SceneRelateJobIddevice];
				            			if(_parameterDataStr!=undefined){
				            				var _parameterData = JSON.parse(_parameterDataStr);
				            				var selectRadio1='.mui-input-row.mui-radio[data-iddevice='+'"'+SceneRelateJobIddevice+'"]';
						            		var selectRadio1Element=document.getElementById('privacy').querySelector(selectRadio1);
				            				var labelNodeChild = selectRadio1Element.querySelector("input[name='radio1']").parentNode.querySelector('h5.mui-ellipsis');
									    	var labelNode = labelNodeChild.parentNode;
									    	labelNode.innerHTML = "";
									    	labelNode.appendChild(labelNodeChild);
					            			for(var param in _parameters){
					            				if(param!="deviceName" && param!="idDevice" && param!="state" && param.indexOf("CompareSymbols")<0){
										    		//将参数填充到触发源中
											    	var h5Node = document.createElement("h5");
											    	h5Node.className = "parameter";
											    	h5Node.dataset.name = param;
											    	h5Node.dataset.title = _parameterData[param].name;
											    	h5Node.dataset.value = _parameters[param];
											    	h5Node.dataset.unit = _parameterData[param].unit;
											    	h5Node.dataset.CompareSymbols = _parameters[param+"CompareSymbols"];
											    	h5Node.innerHTML = _parameterData[param].name+' : '+_parameters[param+"CompareSymbols"]+' '+_parameters[param]+' '+_parameterData[param].unit;
											    	labelNode.appendChild(h5Node);
												}
					            			}
											labelNode.parentNode.querySelector("input[name='radio1']").checked = true;
											labelNode.parentNode.querySelector("input[name='radio1']").disabled = false;
				            			}
									}
									//动态设置触发源列表的高度，设置visibility和display是因为第一次进入页面时privacyNode高度为0不能设置slider的高度
									var privacyNode = document.getElementById('privacy');
									privacyNode.style.visibility = 'hidden';
									privacyNode.style.display = 'block';
									document.getElementById('slider').style.height=privacyNode.querySelector(".mui-scroll").offsetHeight+'px';
									privacyNode.style.visibility = '';
									privacyNode.style.display = '';

									function otherWay(argument) {
										var li=document.getElementById('privacy').querySelectorAll('li.mui-table-view-cell');
										Array.prototype.forEach.call(li,function(currentValue,index) {
										if (argument==currentValue.querySelector('.mui-input-row.mui-radio').dataset.iddevice) {
											currentValue.querySelector("input[name='radio1']").disabled=true;
										}
										})
									}
								},
				    			error:function(){
				    				mui.alert('获取已添加触发源失败,请检查网络');
				    				return;
				    			}				
							}); 		    		
				    	} 	
			        },
			        error:function(){
	    				mui.alert('获取触发源失败,请检查网络');
	    				return;
	    			}	     			    			
		     	});
	    	}catch(e){
	    		document.getElementById('privacy').querySelector('.mui-table-view').innerHTML+='<li class="mui-table-view-cell" style="color:#f00">无法跨域请求资源</li>'; 
	    	}

	     	try{
		     	Zepto.ajax({//情景模式
		     		url:$interface.getSceneControlID(),
		     		type:'get',
		     		async:false,
		     		success:function(data) {//返回的是json字符串
		     			var senceData=JSON.parse(data).data;
			 	    	if (!senceData||senceData.length==0) {                
				    		document.getElementById('general').querySelector('.mui-table-view').innerHTML+='<li class="mui-table-view-cell" style="color:#f00">该家庭没有添加情景模式</li>';                
				    		document.getElementById('account').querySelector('.mui-table-view').innerHTML+='<li class="mui-table-view-cell" style="color:#f00">该家庭没有添加情景模式</li>';                
				    		document.getElementById('feedback').querySelector('.mui-table-view').innerHTML+='<li class="mui-table-view-cell" style="color:#f00">该家庭没有添加情景模式</li>';                
			            }else{
					    	var str1='<li class="mui-table-view-cell">,,,<input name="radio2" type="radio">,</div>,</li>';//就执行情景模式
					    	var str3='<li class="mui-table-view-cell">,,,<input name="radio" type="radio" disabled>,</div>,</li>';//再执行情景模式	
					    	var str4='<li class="mui-table-view-cell">,,,<input name="radio" type="radio">,</div>,</li>';//再执行情景模式 
					    	var arr1=str1.split(',');
					    	var arr3=str3.split(',');
					    	var arr4=str4.split(',');  
					    	var sum=0;
					        senceData.forEach(function(element,index,array){//就执行情景模式 	
					            element.scenes.forEach(function(ele,i,arr){
					            	var num=i;
					            	if (index>=1) {
					            		sum=array[index-1].scenes.length; 
					            		num=i+sum;
					            	}
					            	arr1[0]="<li class='mui-table-view-cell'"+" "+'data-idGroup='+element.idGroup+" "+'data-select='+num+'>';//dataSelect==索引值
					            	arr1[1]="<div class='mui-input-row mui-radio'"+" "+'data-idScene='+ele.idScene+'>';
					            	arr1[2]='<label>'+ele.nameScene+'</label>';str1=arr1.join('');
					            	if( document.getElementById('general')){
					            		document.getElementById('general').querySelector('.mui-table-view').innerHTML+=str1;
					            	}
					        	}); 
					    	});
					        senceData.forEach(function(element,index,array){//再执行情景模式
					            element.scenes.forEach(function(ele,i,arr){
					            	var num=i;
					            	if (index>=1) {
					            		sum=array[index-1].scenes.length; 
					            		num=i+sum;
					            	}
					                arr3[0]="<li class='mui-table-view-cell'"+" "+'data-idGroup='+element.idGroup+" "+'data-select='+num+'>';
					                arr3[1]="<div class='mui-input-row mui-radio'"+" "+'data-idScene='+ele.idScene+'>';
					                arr3[2]='<label>'+ele.nameScene+'</label>';str3=arr3.join('');
					                if( document.getElementById('feedback')){
					                	document.getElementById('feedback').querySelector('.mui-table-view').innerHTML+=str3;                	
					                }
					            });
					        });
					        senceData.forEach(function(element,index,array){//再执行情景模式副本
					            element.scenes.forEach(function(ele,i,arr){
					            	var num=i;
					            	if (index>=1) {
					            		sum=array[index-1].scenes.length; 
					            		num=i+sum;
					            	}
					                arr4[0]="<li class='mui-table-view-cell'"+" "+'data-idGroup='+element.idGroup+" "+'data-select='+num+'>';
					                arr4[1]="<div class='mui-input-row mui-radio'"+" "+'data-idScene='+ele.idScene+'>';
					                arr4[2]='<label>'+ele.nameScene+'</label>';str4=arr4.join('');
					                if( document.getElementById('account')){
					                	document.getElementById('account').querySelector('.mui-table-view').innerHTML+=str4;
					            	}
					            });  
					        });	
			            }      			    			
		     		},
		     		error:function(){
		     			mui.alert('获取情景模式失败!');
		     		}
		     	}); 
	     	}catch(e){
	    		document.getElementById('general').querySelector('.mui-table-view').innerHTML+='<li class="mui-table-view-cell" style="color:#f00">无法跨域请求资源</li>';                
	    		document.getElementById('account').querySelector('.mui-table-view').innerHTML+='<li class="mui-table-view-cell" style="color:#f00">无法跨域请求资源</li>';                
	    		document.getElementById('feedback').querySelector('.mui-table-view').innerHTML+='<li class="mui-table-view-cell" style="color:#f00">无法跨域请求资源</li>';   
	     	}	     		    	    	   	        
	 	},
	 	_copyData:function(str,index){
			document.getElementById('setting').querySelector('.mui-table-view').innerHTML+='<li class="mui-table-view-cell general list" data-Index='+index+'>'+'<a href="#account" class="mui-navigate-right"><span class="mui-icon iconfont icon-run"></span>再执行...(某个情景模式)</a>'+str+'</li>' ;  
	 	}         
	}
	setList.setSenceData();
	$.back = function() {
		if (viewApi.canBack()) { //如果view可以后退，则执行view的后退
			viewApi.back();
		} else { //执行webview后退
			oldBack();
		}
	};
	//监听页面切换事件方案1,通过view元素监听所有页面切换事件，目前提供pageBeforeShow|pageShow|pageBeforeBack|pageBack四种事件(before事件为动画开始前触发)
	//第一个参数为事件名称，第二个参数为事件回调，其中e.detail.page为当前页面的html对象
	view.addEventListener('pageBeforeShow', function(e) {
		if (e.detail.page.id=='account') {
			var _radioLen=document.getElementById('account').querySelectorAll('.mui-table-view input');
			var radio2Check=document.querySelector(".mui-table-view-cell.list.list2");
			var radio2CheckIdsence=radio2Check.querySelector('.mui-input-row.mui-radio').dataset.idscene;
			var general=document.querySelectorAll('.general');	
			Array.prototype.forEach.call(_radioLen,function(currentValue,index,arr) {
				currentValue.disabled=false;
			});				
			Array.prototype.forEach.call(general,function(currentValue,index,arr) {
				var _idsence=currentValue.querySelector(".mui-input-row.mui-radio").dataset.idscene;
				var _idselect=currentValue.querySelector(".mui-table-view-cell").dataset.select;
				//当设备被删除时_idselect为undefined，跳过该操作
				if(_idsence!=undefined){
					if (_radioLen[_idselect].parentNode.dataset.idscene==_idsence) {
						_radioLen[_idselect].disabled=true;
					}else{
						var $select='#account .mui-input-row.mui-radio[data-idscene='+'"'+_idsence+'"'+']';
						document.querySelector($select).querySelector("input").disabled=true;
					}	
				}			
			})
			if (_radioLen[radio2Check.querySelector(".mui-table-view-cell").dataset.select].parentNode.dataset.idscene==radio2CheckIdsence) {
				_radioLen[radio2Check.querySelector(".mui-table-view-cell").dataset.select].disabled=true;
			}else{
				var $select='#account .mui-input-row.mui-radio[data-idscene='+'"'+radio2CheckIdsence+'"'+']';
				document.querySelector($select).querySelector("input").disabled=true;
			}			
			if (SetTask.isEmpty(_copyRadio)) {
				_copyRadio=$copyEdit.$copyRadio;
			}
			Array.prototype.forEach.call(_radioLen,function(currentValue,index,array){									
				currentValue.name='radio'+generalRadio.index;
				if (currentValue.parentNode.dataset.idscene==_copyRadio['radio'+generalRadio.index]) {
					currentValue.checked=true;
					currentValue.disabled=false;
				}
			})				
		}
		if (e.detail.page.id=='general') {
			var general=document.querySelectorAll('.general');
			Array.prototype.forEach.call(document.querySelectorAll("input[name='radio2']"),function(currentValue,index,arr) {
				currentValue.disabled=false;
			});			
			Array.prototype.forEach.call(general,function(currentValue,index,arr) {
				var _idsence=currentValue.querySelector(".mui-input-row.mui-radio").dataset.idscene;
				var _idselect=currentValue.querySelector(".mui-table-view-cell").dataset.select;
				//当设备被删除时_idselect为undefined，跳过该操作
				if(_idselect!=undefined){
					if (document.querySelectorAll("input[name='radio2']")[_idselect].parentNode.dataset.idscene==_idsence) {
						document.querySelectorAll("input[name='radio2']")[_idselect].disabled=true;
					}else{
						var $select='#general .mui-input-row.mui-radio[data-idscene='+'"'+_idsence+'"'+']';
						document.querySelector($select).querySelector("input[name='radio2']").disabled=true;
					}
				}
									
			})				
		}
	});
	view.addEventListener('pageShow', function(e) {
		if (e.detail.page.id=='account') {
			var _radioLen=document.getElementById('account').querySelectorAll('.mui-table-view input');
			var radio2Check=document.querySelector(".mui-table-view-cell.list.list2");
			var radio2CheckIdsence=radio2Check.querySelector('.mui-input-row.mui-radio').dataset.idscene;
			var general=document.querySelectorAll('.general');	
			var selectedIdscene = document.querySelector('li[data-index="'+generalRadio.index+'"]').querySelector('.mui-input-row.mui-radio').dataset.idscene;
			Array.prototype.forEach.call(_radioLen,function(currentValue,index,arr) {
				currentValue.disabled=false;
			});				
			Array.prototype.forEach.call(general,function(currentValue,index,arr) {
				var _idsence=currentValue.querySelector(".mui-input-row.mui-radio").dataset.idscene;
				var _idselect=currentValue.querySelector(".mui-table-view-cell").dataset.select;
				//当设备被删除时_idselect为undefined，跳过该操作
				if(_idselect!=undefined){
					if (_radioLen[_idselect].parentNode.dataset.idscene==_idsence) {
						_radioLen[_idselect].disabled=true;
					}else{
						var $select='#account .mui-input-row.mui-radio[data-idscene='+'"'+_idsence+'"'+']';
						document.querySelector($select).querySelector("input").disabled=true;
					}	
				}			
			})
			Array.prototype.forEach.call(_radioLen,function(currentValue,index,array){									
				//currentValue.name='radio'+generalRadio.index;
				//当设备被删除时_idselect为undefined，跳过该操作
				if(selectedIdscene!=undefined){
					if(currentValue.parentNode.dataset.idscene==selectedIdscene){
						currentValue.checked=true;
						currentValue.disabled=false;
					}
				}else{
					currentValue.checked=false;
				}
			});
			if (_radioLen[radio2Check.querySelector(".mui-table-view-cell").dataset.select].parentNode.dataset.idscene==radio2CheckIdsence) {
				_radioLen[radio2Check.querySelector(".mui-table-view-cell").dataset.select].disabled=true;
			}else{
				var $select='#account .mui-input-row.mui-radio[data-idscene='+'"'+radio2CheckIdsence+'"'+']';
				document.querySelector($select).querySelector("input").disabled=true;
			}			
			if (SetTask.isEmpty(_copyRadio)) {
				_copyRadio=$copyEdit.$copyRadio;
			}			
		}
		var delayAll=JSON.parse(sessionStorage.getItem('delayAll'))||{};//延时对象
		delayAll.now=generalRadio.index-1;
		sessionStorage.setItem('delayAll',JSON.stringify(delayAll));
	});
	view.addEventListener('pageBeforeBack', function(e) {
	});
	view.addEventListener('pageBack', function(e) {
	// console.log(e.detail.page.id + ' back');
	});
	$('#Popover_0').on('tap','.mui-table-view-cell', function (e) {//星期选择
        var SceneRelateJobTimeResult1= document.querySelector('.timeWrap #TIME1').value;
        var SceneRelateJobTimeResult2= document.querySelector('.timeWrap #TIME2').value;
        var week=['MON','TUE','WED','THU','FRI','SAT','SUN'];
        if (SceneRelateJobTimeResult2==""||SceneRelateJobTimeResult2=="") {//判断时间是否为空
            mui.alert('请选择正确的时间', '');
            return;
        }else{
            timeAll[0]={hour:SceneRelateJobTimeResult1.split(":")[0],minute:SceneRelateJobTimeResult1.split(":")[1]}
            timeAll[1]={hour:SceneRelateJobTimeResult2.split(":")[0],minute:SceneRelateJobTimeResult2.split(":")[1]}
        }
	    if(this.childNodes[0].innerHTML=='自定义'){		        	        	
	    	$('#Popover_0').popover('hide');
	    	$('#Popover_1').popover('show');
            document.querySelector('.mui-backdrop').parentNode.removeChild(document.querySelector('.mui-backdrop'));
            document.querySelector('.Cmui-popup-backdrop').style.display="block";               
            document.querySelector('.Cmui-popup-backdrop').classList.add('mui-active');
            if (document.querySelector('.Cmui-popup-backdrop.mui-active')) {
                document.querySelector('.Cmui-popup-backdrop.mui-active').addEventListener('tap',function(){                   
                    this.classList.remove('mui-active');
                    this.style.display="";
                    $('#Popover_1').popover('hide');
                })        
            }	    		        	
	    }else if (this.childNodes[0].innerHTML=='每天') {
	    	$('.week')[0].value='每天 ';
	    	forweek.innerHTML='每天';	    	
	    	forweek.dataset.week='MON,TUE,WED,THU,FRI,SAT,SUN';
	    	var setweek2=new SetWeek();
	    	week.forEach(function(ele,index,arr){
	    		setweek2=new SetWeek(true,ele,index);
	    		setweek2.setValue();		        		
	    	})
	    	setweek2.setArr();
	    }else if (this.childNodes[0].innerHTML=='工作日') {
	    	$('.week')[0].value='工作日 ';
	    	document.getElementById('forweek').innerHTML='工作日';
	    	forweek.dataset.week='MON,TUE,WED,THU,FRI';
	    	var setweek3=new SetWeek();	        	
	    	week.forEach(function(ele,index,arr){
	    		var check=true;
	    		if (ele=='SAT'||ele=='SUN') {
	    			check=false;
	    		}
	    		setweek3=new SetWeek(check,ele,index);
	    		setweek3.setValue();	
	    	})
	    	setweek3.setArr();
	    }else if (this.childNodes[0].innerHTML=='周末') {
		    	$('.week')[0].value='周末 ';
		    	forweek.innerHTML='周末';
		    	forweek.dataset.week='SAT,SUN';
		    	var setweek4=new SetWeek();		        	
		    	week.forEach(function(ele,index,arr){
		    		var check=true;
		    		if (ele=='MON'||ele=='TUE'||ele=='WED'||ele=='THU'||ele=='FRI') {
		    			check=false;
		    		}
		    		setweek4=new SetWeek(check,ele,index);
		    		setweek4.setValue();
		    	})
		    	setweek4.setArr();
	    }
	 	$('#Popover_0').popover('hide');
	});
	$('#Popover_1').on('tap','#SweekBtn', function (e) {//自定义星期的确定按钮 
	 	document.querySelector('.Cmui-popup-backdrop.mui-active').style.display=""; 
	 	forweek.dataset.week="";		
		$('.mui-input-group input').each(function(index,element) {//遍历星期
	        var check=this.checked;
	        var objName=this.value;		            
	        var setweek=new SetWeek(check,objName,index);
	            setweek.setValue()
            if (this.checked) {
                var weekendArray=['MON','TUE','WED','THU','FRI','SAT','SUN'];
                forweek.dataset.week+=weekendArray[index]+',';
            }  	       
	    });
	        var setweek1=new SetWeek();
	        setweek1.checkInvalid('add',parameters)
	        setweek1.setArr();
	});
	$('#Popover_1').on('tap','#CweekBtn', function (e) {//自定义星期的取消按钮
		document.querySelector('.Cmui-popup-backdrop.mui-active').style.display=""; 
	});
	$('#newTask').on('tap', '#feedadd', function(event) {//动态添加任务
		if (!document.querySelector("input[name='radio']:checked")) {
			return;
		}
	    var idscene=document.querySelector("input[name='radio']:checked").parentNode.dataset.idscene;
	    var idgroup=document.querySelector("input[name='radio']:checked").parentNode.parentNode.dataset.idgroup;
	    var _select=document.querySelector("input[name='radio']:checked").parentNode.parentNode.dataset.select;
		var general=document.querySelectorAll('.general').length;	
		var _index=general+3;
		var key='radio'+_index;
	    var _len=document.querySelectorAll('.general');
	    var go=1;
		var str='<ul class="mui-table-view"><li class="mui-table-view-cell" data-idgroup='+idgroup+" "+'data-select='+_select+'><div class="mui-input-row mui-radio" data-idscene='+idscene+'><label class="mui-ellipsis" id="sceneNameDiv"><span>'+document.querySelector("input[name='radio']:checked").parentNode.querySelector('label').innerHTML+'</span><a class="delayA">[延迟5秒]</a></label><a href="#" class="mui-btn delete">删除</a><a href="#delayTime" class="mui-btn ys">延时</a></div></li></ul>'; 
		document.getElementById('taskName').classList.remove('mui-input-clear');
		document.getElementById('taskName').removeAttribute("data-input-clear");
		setTimeout(function(){
			document.getElementById('taskName').value=Taskinner;
		},60);
		Array.prototype.forEach.call(_len,function(c,i,a){//防止出现重复
			if(c.querySelector('.mui-input-row.mui-radio').dataset.idscene==idscene){
				go=0;
			}
		});			
		_copyRadio[key]=idscene;
		if (go) {
			setList._copyData(str,_index);
		}
		var delayAll=JSON.parse(sessionStorage.getItem('delayAll'))||{};//延时对象
		var delayArr=delayAll.delayArr||[];//延时列表
		delayArr.push({"num":_index-1,"delayTime":"5"});
		delayAll.now=_index-1; 
		delayAll.delayArr=delayArr;        		
		sessionStorage.setItem('delayAll',JSON.stringify(delayAll));	

		//动态添加情景模式最多5个
		if(document.getElementById('setting').querySelectorAll('.list').length==7){
			mui.toast('动态添加情景模式数量已达上限');
			document.querySelector('.mui-table-view.mui-table-view-chevron.addFeedback').style.display = "none";
		} 		            
	});
	$('#newTask').on('tap','#privacyBack',function(e){//触发源的view的返回任务
		if (!document.querySelector("input[name='radio1']:checked")) {
			return;
		}
		var checked=document.querySelector("input[name='radio1']:checked");
		var _select=checked.parentNode.parentNode.parentNode.dataset.select;
		var _id=checked.parentNode.parentNode.parentNode.dataset.id;
		var _idgateway=checked.parentNode.parentNode.dataset.idgateway;
		var _iddevice=checked.parentNode.parentNode.dataset.iddevice;
		var _namedevice=checked.parentNode.querySelector('label.mui-ellipsis').dataset.namedevice;
		var _typedevice=checked.parentNode.querySelector('h5.mui-ellipsis').dataset.typedevice;
		var parameterNodes=checked.parentNode.querySelectorAll('.parameter');
		if(parameterNodes.length>0){
			var _parameters = "";//用于显示
			var _parametersDataset = new Object();//用于传值
			//转义<和>，防止标签化
			for(var i=0,len=parameterNodes.length; i<len; i++){
				_parameters += parameterNodes[i].dataset.title+":"+parameterNodes[i].dataset.CompareSymbols+parameterNodes[i].dataset.value+"("+parameterNodes[i].dataset.unit+");";
				_parametersDataset[parameterNodes[i].dataset.name] = parameterNodes[i].dataset.value;
				if(parameterNodes[i].dataset.CompareSymbols==">"){
					_parametersDataset[parameterNodes[i].dataset.name+"CompareSymbols"] = "&gt;";
				}else if(parameterNodes[i].dataset.CompareSymbols=="<"){
					_parametersDataset[parameterNodes[i].dataset.name+"CompareSymbols"] = "&lt;";
				}else{
					_parametersDataset[parameterNodes[i].dataset.name+"CompareSymbols"] = parameterNodes[i].dataset.CompareSymbols;
				}
			}	
			var state = checked.parentNode.querySelector('h5.mui-ellipsis').dataset.state;
			if(state != null){
				_parametersDataset["state"] = state;
			}
			var str='<ul class="mui-table-view"><li class="mui-table-view-cell" data-id='+_id+" "+'data-select='+_select+'><div class="mui-input-row mui-radio" data-idgateway='+_idgateway+" "+'data-iddevice='+_iddevice+'><div class="mui-col-xs-12"><label class="mui-ellipsis" data-namedevice='+_namedevice+'>'+_namedevice+"["+_typedevice+"]"+'</label><label class="mui-ellipsis" id="parameters" data-parameters='+JSON.stringify(_parametersDataset)+'>'+_parameters+'</label></div></div></li></ul>';	
		}else{
			var parameterData = JSON.parse(sessionStorage.getItem('parameterData'));
			var _parametersDataset = JSON.parse(parameterData[_iddevice]);
			var str='<ul class="mui-table-view"><li class="mui-table-view-cell" data-id='+_id+" "+'data-select='+_select+'><div class="mui-input-row mui-radio" data-idgateway='+_idgateway+" "+'data-iddevice='+_iddevice+'><div class="mui-col-xs-12"><label class="mui-ellipsis" data-namedevice='+_namedevice+'>'+_namedevice+"["+_typedevice+"]"+'</label><label class="mui-ellipsis noneLabel" id="parameters" data-parameters='+JSON.stringify(_parametersDataset)+'></label></div></div></li></ul>';		
		}
		document.getElementById('setting').querySelector('.list1').innerHTML='<a href="#privacy" class="mui-navigate-right"><span class="mui-icon iconfont icon-triggering"></span>如果发生了...(触发源)</a>'+str;   
	});
	$('#newTask').on('tap', "#generalBack", function() {//就执行情景模式的view的返回任务
		if (!document.querySelector("input[name='radio2']:checked")) {
			return;
		}
		var checked=document.querySelector("input[name='radio2']:checked");
	    var idscene=checked.parentNode.dataset.idscene;
	    var idgroup=checked.parentNode.parentNode.dataset.idgroup;
	    var _select=checked.parentNode.parentNode.dataset.select;
	    var str='<ul class="mui-table-view"><li class="mui-table-view-cell" data-idgroup='+idgroup+" "+'data-select='+_select+'><div class="mui-input-row mui-radio" data-idscene='+idscene+'><label class="mui-ellipsis">'+checked.parentNode.querySelector('label').innerHTML+'</label></div></li></ul>';	     
		document.getElementById('setting').querySelector('.list2').innerHTML='<a href="#general" class="mui-navigate-right"><span class="mui-icon iconfont icon-run"></span>就执行...(某个情景模式)</a>'+str;	            
	});	        
	$('#newTask').on('tap', "#notificationsBack", function(event) {//选择时间的view的返回任务
		if (!document.querySelector("input[name='radio0']:checked")) {
			return;
		}
		var checked=document.querySelector("input[name='radio0']:checked");
		var SceneRelateJobTimeResult1=document.querySelector('.timeWrap #TIME1').value;
		var SceneRelateJobTimeResult2=document.querySelector('.timeWrap #TIME2').value;
		//var inner=checked.parentNode.querySelector('label').innerHTML;
		var inner=checked.previousSibling.innerHTML;
		if (inner=='任何时间') {
			document.getElementById('setting').querySelector('.list0').innerHTML='<a href="#notifications" class="mui-navigate-right"><span class="mui-icon iconfont icon-timing"></span>请选择时间</a><ul class="mui-table-view"><li class="mui-table-view-cell" data-select='+0+'><div class="mui-input-row mui-radio"><label class="mui-ellipsis">任何时间</label></div></li></ul>';	        		
		}else if(SceneRelateJobTimeResult1!==""&&SceneRelateJobTimeResult2!==""){
	        var getCronExpression=function(){//编辑任务(edit.html)的判断方法,添加任务不需要(app.html)
				if (location.href.split('/')[location.href.split('/').length-1].indexOf('app.html')!=-1) return;
				if (SetTask.isEmpty(saveAll)) {
					saveAll=$copyEdit.saveAll;
					timeAll=$copyEdit.timeAll;
				}
			};
			getCronExpression();
        }else{
			if (SetTask.isEmpty(saveAll)) {
				document.getElementById('setting').querySelector('.list0').innerHTML='<a href="#notifications" class="mui-navigate-right"><span class="mui-icon iconfont icon-timing"></span>请选择时间</a>';
				return;
			}    		
		}		
	});       	        
	$('#newTask').on('tap', "#accountBack", function() {//动态任务的view的返回任务
		var checked=document.getElementById('account').querySelector('input[type="radio"]:checked');
	    var idscene=checked.parentNode.dataset.idscene;
	    var idgroup=checked.parentNode.parentNode.dataset.idgroup;
	    var _select=checked.parentNode.parentNode.dataset.select;
	    var _radio=checked.name[5];
	    var go=1;
	    var delayA;
	    var _len=document.querySelectorAll('.general');	
		if (document.querySelectorAll('.list')[_radio].querySelector('.delayA')) {
			delayA=document.querySelectorAll('.list')[_radio].querySelector('.delayA');
		}	    
		var str='<ul class="mui-table-view"><li class="mui-table-view-cell" data-idgroup='+idgroup+" "+'data-select='+_select+'><div class="mui-input-row mui-radio" data-idscene='+idscene+'><label class="mui-ellipsis" id="sceneNameDiv"><span>'+checked.parentNode.querySelector('label').innerHTML+'</span></label class="mui-ellipsis"><a href="#" class="mui-btn delete">删除</a><a href="#delayTime" class="mui-btn ys">延时</a></div></li></ul>'; 	            
		if(go){
			document.querySelectorAll('.list')[_radio].innerHTML='<a href="#account" class="mui-navigate-right"><span class="mui-icon iconfont icon-run"></span>再执行...(某个情景模式)</a>'+str;
		}
		if (delayA) {
			document.querySelectorAll('.list')[_radio].querySelector('.mui-table-view .mui-ellipsis').appendChild(delayA);
		}
		_copyRadio[checked.name]=idscene;	            
	});		        
	$('#setting').on('tap', '.general', function(event) {
	    var _index=this.dataset.index;
		generalRadio.index=_index;            
	});
	$('#setting').on('tap', '.delete', function(event) {//删除动态添加的任务按钮
		var _select=this.parentNode.parentNode.dataset.select;
		var delayAll=JSON.parse(sessionStorage.getItem('delayAll'))||{};//延时对象
		var delayArr=delayAll.delayArr||[];//延时列表
		var num=this.parentNode.parentNode.parentNode.parentNode.dataset.index-1;//当前索引		
		document.getElementsByName('radio2')[0].checked=false;
		this.parentNode.parentNode.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode.parentNode.parentNode);
		delayArr.forEach(function(currentValue,index,arr){
			if (currentValue.num==num) {
				arr.splice(index,1);
			}			
		})		
		delayArr.forEach(function(currentValue,index,arr){
			if (currentValue.num>num) {
				currentValue.num--;
			}		
		})
		delayAll["delayArr"]=delayArr;
		sessionStorage.setItem('delayAll',JSON.stringify(delayAll));
		var general=document.querySelectorAll('.general');
		general.forEach(function(c,i,a){
			c.dataset.index=i+3;
		})	
		//动态添加情景模式最多5个
		if(document.getElementById('setting').querySelectorAll('.list').length<7){
			document.querySelector('.mui-table-view.mui-table-view-chevron.addFeedback').style.display = "";
		} 
	});
	$('#setting').on('tap', '.ys', function(event) {//设置延时任务
		var delayAll=JSON.parse(sessionStorage.getItem('delayAll'))||{};//延时对象
		var delayArr=delayAll.delayArr||[];//延时列表
		var num=this.parentNode.parentNode.parentNode.parentNode.dataset.index-1;//当前索引
		var delayObj={num:num,delayTime:""};//延时信息
		var now=delayAll.now||num;//对比索引
		// if (!SetTask.isEmpty(delayAll)&&num==now&&delayArr.length!==0) {return;}//延时对象中存在就返回
		delayArr.forEach(function(currentValue,index,arr){
			if (currentValue.num==num) {
				arr.splice(index,1);
				delayObj.delayTime=currentValue.delayTime;
			}			
		})	
		delayArr.push(delayObj);
		delayAll["delayArr"]=delayArr;
		delayAll["now"]=num;
		sessionStorage.setItem('delayAll',JSON.stringify(delayAll));
		document.getElementById('field-range-input').value='时间:'+" "+delayObj.delayTime+'秒';
		document.getElementById('field-range').value=delayObj.delayTime;
	});	
	$('#newTask').on('change', "input[name='radio0']", function(event) {
		if (this.parentNode.querySelector('label').innerHTML=='任何时间') {
			document.querySelector('.timeWrap').style.display='none';
			document.querySelector('.weekWrap').style.display='none';
		}else{
			document.querySelector('.timeWrap').style.display='block';
			document.querySelector('.weekWrap').style.display='block';	     		
		}//点击切换显示时间选择器
	});
    forweek.addEventListener('tap',function(argument) {
        var inner=this.innerHTML;
        var weekSelected=document.querySelectorAll("#Popover_0 .mui-table-view-cell");
        if (document.querySelector('#Popover_0 .mui-selected')) {
            document.querySelector('#Popover_0 .mui-selected').classList.remove('mui-selected');
        }
        if (inner=='每天') {
            weekSelected[0].classList.add('mui-selected');
             $('.mui-input-group input').each(function(index,element) {//遍历星期
                this.checked=false;
            });
        }else if(inner=='工作日') {
            weekSelected[1].classList.add('mui-selected');
             $('.mui-input-group input').each(function(index,element) {//遍历星期
                this.checked=false;
            });
        }else if(inner=='周末') {
            weekSelected[2].classList.add('mui-selected');
             $('.mui-input-group input').each(function(index,element) {//遍历星期
                this.checked=false;
            });
        }else if (inner=="点击选择星期"||inner=="") {return}else{
            weekSelected[3].classList.add('mui-selected');
        }
    })        
	btns.each(function(i, btn) {//时间选择器
		btn.addEventListener('tap', function() {
			var optionsJson = this.getAttribute('data-options') || '{}';
			var options = JSON.parse(optionsJson);
			var id = this.getAttribute('id');
			var picker = new $.DtPicker(options);
			var that=this;
			// $('ul.mui-pciker-list li').each(function(index, element) {
			// 	if (this.parentNode.parentNode.parentNode.dataset.id=='picker-h') {
			// 		if (this.innerText<nowHour) {
			// 			this.classList.add('disabled');
			// 		}
			// 	}else if (this.parentNode.parentNode.parentNode.dataset.id=='picker-i') {
			// 		if (this.innerText<nowMinute) {
			// 			this.classList.add('disabled');
			// 		}
			// 	}
			// });
			var comparision=function(){//判断开始时间和结束时间的关系
				if (!timeAll[0]) {
					$.alert('开始时间不能为空');
					timeAll[1]=undefined;
					return;
				}
				var checkHour0=timeAll[0].hour,checkMinute0=timeAll[0].minute;
				if(timeAll[1]){
	  				var checkHour1=timeAll[1].hour,checkMinute1=timeAll[1].minute;
					if (checkHour0>checkHour1){
						$.alert('结束时间不能小于开始时间');timeAll=[];
						document.getElementById('TIME2').innerHTML="选择时间 ...";
						document.getElementById('TIME2').value="";
						document.getElementById('setting').querySelector('.list0').innerHTML='<a href="#notifications" class="mui-navigate-right"><span class="mui-icon iconfont icon-timing"></span>请选择时间</a>';
						return false;
					}
	  				if (checkHour0==checkHour1){
	  					if (checkMinute0>=checkMinute1) {
	  						$.alert('开始时间不能小于或者等于结束时间');that.innerHTML="选择时间 ...";timeAll.pop();
							document.getElementById('setting').querySelector('.list0').innerHTML='<a href="#notifications" class="mui-navigate-right"><span class="mui-icon iconfont icon-timing"></span>请选择时间</a>';
	  						return false;
	  					}
	  				}
				}
			};
			picker.show(function(rs) {//确定按钮
						/*
						 * rs.value 拼合后的 value
						 * rs.text 拼合后的 text
						 * rs.y 年，可以通过 rs.y.vaue 和 rs.y.text 获取值和文本
						 * rs.m 月，用法同年
						 * rs.d 日，用法同年
						 * rs.h 时，用法同年
						 * rs.i 分（minutes 的第二个字母），用法同年
						 */
						var obj={hour:rs.h.value,minute:rs.i.value};
						that.innerHTML=rs.text;
						that.value=rs.text;
						var SceneRelateJobTimeResult1=document.querySelector('.timeWrap #TIME1').value;
						var SceneRelateJobTimeResult2=document.querySelector('.timeWrap #TIME2').value;
						if(SceneRelateJobTimeResult1!==""&&SceneRelateJobTimeResult2!==""){
				            timeAll[0]={hour:SceneRelateJobTimeResult1.split(":")[0],minute:SceneRelateJobTimeResult1.split(":")[1]};
				            timeAll[1]={hour:SceneRelateJobTimeResult2.split(":")[0],minute:SceneRelateJobTimeResult2.split(":")[1]};
				        }
						timeAll[i]=obj;
						comparision();
						if (forweek.innerHTML!=="") {
                            var weekendStr=forweek.dataset.week;
                            var weekendArray=['MON','TUE','WED','THU','FRI','SAT','SUN'];
                            weekendArray.forEach(function(currentValue,index){
                                if(weekendStr&&weekendStr.indexOf(currentValue)>-1){
                                    saveAll[currentValue]=timeAll;
                                }
                            });
                        }
						if (timeAll[0]!==undefined&&timeAll[1]!==undefined&&!SetTask.isEmpty(saveAll)) {
					   		var star=timeAll[0].hour+':'+timeAll[0].minute;
					   		var end=timeAll[1].hour+':'+timeAll[1].minute;
				   			document.getElementById('setting').querySelector('.list0').innerHTML='<a href="#notifications" class="mui-navigate-right"><span class="mui-icon iconfont icon-timing"></span>请选择时间</a><ul class="mui-table-view"><li class="mui-table-view-cell" data-select='+1+'><div class="mui-input-row mui-radio"><label class="mui-ellipsis"></label></div></li></ul>'
				   			document.querySelector('.list0').querySelector("label.mui-ellipsis").innerHTML=$('.week')[parameters].value+" "+star+"-"+end+"有效";
						}
						/* 
						 * 返回 false 可以阻止选择框的关闭
						 * return false;
						 */
						/*
						 * 释放组件资源，释放后将将不能再操作组件
						 * 通常情况下，不需要示放组件，new DtPicker(options) 后，可以一直使用。
						 * 当前示例，因为内容较多，如不进行资原释放，在某些设备上会较慢。
						 * 所以每次用完便立即调用 dispose 进行释放，下次用时再创建新实例。
						 */
						picker.dispose();
			});
		}, false);
	});
	document.getElementById('field-range-input').value='时间: 15秒';//初始化延时任务的默认时间
	document.getElementById('field-range').value =15;//初始化延时任务的默认时间
	for(var i=0,len=rangeList.length;i<len;i++){
	    rangeList[i].addEventListener('input',function(){
	        if(this.id.indexOf('field')>=0){
	            document.getElementById(this.id+'-input').value ='时间:'+" "+this.value+'秒';
	        }
	    });
	}
	$('#newTask').on('tap', '#delayBack', function(event) {//延时任务view的返回任务
		var delayTime=document.getElementById('field-range').value;
	    var delayAll=JSON.parse(sessionStorage.getItem('delayAll'));
	    var now=delayAll.now;
	    var delayArr=delayAll.delayArr;
	    delayArr.forEach(function(c,i,a){
	    	if (c.num==now) {
	    		c.delayTime=delayTime;
	    		if (document.querySelectorAll('.list')[now+1]) {
	    			var str='['+'延迟'+delayTime+'秒'+']';
	    			var _list=document.querySelectorAll('.list')[now+1];
	    			var a=document.createElement('a');
	    			a.className="delayA"
	    			a.innerHTML=str;
	    			if (_list.querySelector('label.mui-ellipsis .delayA')) {
	    				_list.querySelector('label.mui-ellipsis').replaceChild(a,_list.querySelector('label .delayA'))
	    			}else{
	    				_list.querySelector('label.mui-ellipsis').appendChild(a);
	    			}
	    			
	    		}
	    		return;
	    	}
	    })
	    sessionStorage.setItem('delayAll',JSON.stringify(delayAll));
	});
	$('#newTask').on('tap', '.addFeedback', function(event) {//添加动态任务的view的返回任务
		Taskinner=document.getElementById('taskName').value;
		if (!document.querySelector(".mui-table-view-cell.list.list2").querySelector(".mui-table-view-cell")) {
			return;
		}
		var radio2Check=document.querySelector(".mui-table-view-cell.list.list2");
		var radio2CheckIdsence=radio2Check.querySelector('.mui-input-row.mui-radio').dataset.idscene;		
		var general=document.querySelectorAll('.general');
		if (document.querySelector("input[name='radio']:checked")) {
			document.querySelector("input[name='radio']:checked").checked=false;
		}
		document.querySelectorAll("input[name='radio']").forEach(function(currentValue,index,arr) {
			currentValue.disabled=false;
		});
		if (document.querySelectorAll("input[name='radio']")[radio2Check.querySelector(".mui-table-view-cell").dataset.select].parentNode.dataset.idscene==radio2CheckIdsence) {
			document.querySelectorAll("input[name='radio']")[radio2Check.querySelector(".mui-table-view-cell").dataset.select].disabled=true;
		}else{
				var $select='#feedback .mui-input-row.mui-radio[data-idscene='+'"'+radio2CheckIdsence+'"'+']';
				document.querySelector($select).querySelector("input[name='radio']").disabled=true;
		}
		general.forEach(function(currentValue,index,arr) {
			var _idsence=currentValue.querySelector(".mui-input-row.mui-radio").dataset.idscene;
			var _idselect=currentValue.querySelector(".mui-table-view-cell").dataset.select;
			if (document.querySelectorAll("input[name='radio']")[_idselect].parentNode.dataset.idscene==_idsence) {
				document.querySelectorAll("input[name='radio']")[_idselect].disabled=true;
			}else{
				var $select='#feedback .mui-input-row.mui-radio[data-idscene='+'"'+_idsence+'"'+']';
				document.querySelector($select).querySelector("input[name='radio']").disabled=true;
			}	
		})
	});
	$("#newTask").on('tap', '.list', function(event) {//清除选中文本框后切换view后软键盘存在的bug
		document.getElementById('taskName').blur();
	});
	$("#newTask").on('tap', '#setting', function(event) {//清除选中文本框后切换view后软键盘存在的bug
		var id=event.detail.target.id;
		if (id=='taskName'||id=='taskNameWrap') {
			document.getElementById('taskName').focus();
		}else{
			document.getElementById('taskName').blur();
		}
	});
	document.getElementById('taskName').addEventListener('blur',function(argument) {//清除选中文本框后切换view后软键盘存在的bug
		document.getElementById('taskName').blur();
	});
	if (document.querySelector('.mui-backdrop')) {//清除#Popover_1点击空白出无法退出遮罩层的bug
		document.querySelector('.mui-backdrop').addEventListener('tap',function() {
			document.getElementById('Popover_1').style.display="none";
			document.getElementById('Popover_1').classList.remove('mui-active');
		})		
	}
	function setTask(){//创建任务
		var getCronExpression=function(){//编辑任务(edit.html)的判断方法,添加任务不需要(app.html)
			if (location.href.split('/')[location.href.split('/').length-1].indexOf('app.html')!=-1) return;
			if (SetTask.isEmpty(saveAll)) {
				saveAll=$copyEdit.saveAll;
				timeAll=$copyEdit.timeAll;
			}
		};
		getCronExpression();
	    SetTask.checkJob();
	}
	
	function clearTask(argument) {//取消编辑任务
		mui.confirm('是否取消当前编辑', function(e) {
			if (e.index == 0) {
				return;
			} else {
				sessionStorage.setItem("isTap",JSON.stringify({'#item1mobile':{'state':false,'times':'0'},'#item2mobile':{'state':false,'times':'0'},'now':'#item1mobile'}));                        				
				window.location.href="smarttask.html";
			}
		})
	}
	//点击返回按钮返回到smarttask.html
	mui('body').on('tap', 'button.mui-left.mui-btn.mui-pull-left.goBack', clearTask);

	$("#newTask").on('tap','#savaTask',setTask);//任务添加
	$("#newTask").on('tap','#clearTask',clearTask);//取消编辑任务
});

	//以下四个参数在参数选择框中的“确定”，“取消”事件中用到，赋值在选中设备事件中，故定义为全局变量
	var checkedDevice;//现在选中的设备
	var oldselectedDevice;//之前选中的设备
	var oldCheckedFlag;//判断是否要将之前的参数回滚
	var parameterNodes = null;//旧的参数节点

	//判断触发源设备为感应设备，则打开参数选择
	$("#pullrefresh").on('tap', '.mui-input-row.mui-radio', function(event) {
		var selectedDeviceType = event.target.parentNode.parentNode.querySelector('h5.mui-ellipsis').dataset.typedevice;
		checkedDevice = event.target.parentNode.parentNode.querySelector("input[name='radio1']");
		var radioDisabled = event.target.parentNode.parentNode.querySelector("input[name='radio1']").disabled;
		//oldCheckedFlag为true需当满足操作：
		//选择新设备，放弃之前保存的设备参数（选择了“确定”），在打开的参数选择框中选择“取消”
		//当oldCheckedFlag为true，将之前保存的设备参数重新写回
		oldCheckedFlag = false;
		oldselectedDevice = document.querySelector("input[name='radio1']:checked");
		if(oldselectedDevice!=null && !radioDisabled){
			parameterNodes = oldselectedDevice.parentNode.querySelectorAll('.parameter');
			//判断是否有参数，有 说明为已选择的感应设备
			if(parameterNodes.length>0){
				//获取已选择的感应设备类型，若与现在选择的设备类型不一致，则提示是否放弃上次保存的参数
				var oldselectedDeviceType = oldselectedDevice.parentNode.querySelector('h5.mui-ellipsis').dataset.typedevice;
				if(oldselectedDeviceType!=selectedDeviceType){
					var btnArray = ['确定', '取消'];
					mui.confirm('是否放弃之前保存的设备参数？', '', btnArray, function(e) {
						if (e.index == 0) {
							/*for(var i=0,len=parameterNodes.length; i<len; i++){
								parameterNodes[i].parentNode.removeChild(parameterNodes[i]);
							}*/
							oldCheckedFlag = true;
							selectParameter();
						} else {
							//取消选中
							checkedDevice.checked = false;
							oldselectedDevice.checked = true;
							return;
						}
					})
				}else{
					selectParameter();
				}
			}else{
				selectParameter();
			}
		}else{
			selectParameter();
		}

		
		//感应设备参数选择
		function selectParameter(){
			var deviceParam = JSON.parse(event.target.parentNode.parentNode.querySelector('h5.mui-ellipsis').dataset.deviceParam);
			var radioDisabled = event.target.parentNode.parentNode.querySelector("input[name='radio1']").disabled;
			var parameterPopoverForm = document.querySelector('#parameterPopover').querySelector('.mui-input-group');
			parameterPopoverForm.innerHTML = "";
			var index = 0;
			//将所选设备的参数列表动态添加到id=parameterPopover的容器中
			for(var param in deviceParam){
				//设备默认值
				var defaultValue = 0;
				switch(param){
					case "illuminance":
				  		defaultValue = 50;
						break;
					case "methane":
					  	defaultValue = 100;
						break;
					case "carbon_monoxide":
					  	defaultValue = 50;
						break;
					case "temperature":
					  	defaultValue = 10;
						break;
					case "humidity":
					  	defaultValue = 35;
						break;
					default:
						break;
				}
				if(param=="state"){
					parameterPopoverForm.innerHTML += '<div class="hiddenDiv" id="state">'+deviceParam[param]+'</div>';
				}else if(param=="methane" || param=="carbon_monoxide"){
					parameterPopoverForm.innerHTML += '<div class="mui-input-row mui-input-range" data-type="'+param+'" data-min="'+deviceParam[param].min+'" data-max="'+deviceParam[param].max+'" data-title='+deviceParam[param].name+' data-unit='+deviceParam[param].unit+' data-name='+param+'>'+
														   '<label class="paramName">'+deviceParam[param].name+'('+deviceParam[param].unit+')</label><span class="mui-icon mui-icon-arrowright CompareSymbols"></span><input type="text" id="range'+index+'-input" value="0" autocomplete="off" data-default-value='+defaultValue+' /><span class="mui-icon mui-icon-help" data-default-value='+defaultValue+'></span>'+
														   '<input type="range" min="'+deviceParam[param].min+'" max="'+deviceParam[param].max+'" id="range'+index+'" value='+defaultValue+' />'+
														   '<text class="minNum">'+deviceParam[param].min+'</text><text class="maxNum">'+deviceParam[param].max+'</text>'+
													   '</div>';
					index++;
				}else if(param=="temperature" || param=="illuminance"){
					parameterPopoverForm.innerHTML += '<div class="mui-input-row mui-input-range" data-type="'+param+'" data-min="'+deviceParam[param].min+'" data-max="'+deviceParam[param].max+'" data-title='+deviceParam[param].name+' data-unit='+deviceParam[param].unit+' data-name='+param+'>'+
														   '<label class="paramName">'+deviceParam[param].name+'('+deviceParam[param].unit+')</label><button class="mui-icon mui-icon-arrowleft CompareSymbols" onclick="return false"></button><input type="text" id="range'+index+'-input" value="0" autocomplete="off" data-default-value='+defaultValue+'  />'+
														   '<input type="range" min="'+deviceParam[param].min+'" max="'+deviceParam[param].max+'" id="range'+index+'" value='+defaultValue+' />'+
														   '<text class="minNum">'+deviceParam[param].min+'</text><text class="maxNum">'+deviceParam[param].max+'</text>'+
													   '</div>';
					index++;
				}else if(param=="humidity"){
					parameterPopoverForm.innerHTML += '<div class="mui-input-row mui-input-range" data-type="'+param+'" data-min="'+deviceParam[param].min+'" data-max="'+deviceParam[param].max+'" data-title='+deviceParam[param].name+' data-unit='+deviceParam[param].unit+' data-name='+param+'>'+
														   '<label class="paramName">'+deviceParam[param].name+'('+deviceParam[param].unit+')</label><button class="mui-icon mui-icon-arrowleft CompareSymbols" onclick="return false"></button><input type="text" id="range'+index+'-input" value="0" autocomplete="off" data-default-value='+defaultValue+'  />'+
														   '<input type="range" min="'+deviceParam[param].min+'" max="'+deviceParam[param].max+'" id="range'+index+'" step="0.1" value='+defaultValue+' />'+
														   '<text class="minNum">'+deviceParam[param].min+'</text><text class="maxNum">'+deviceParam[param].max+'</text>'+
													   '</div>';
					index++;
				}
			}
			parameterPopoverForm.innerHTML += '<div class="mui-button-row">'+
													'<button class="mui-btn mui-btn-success" id="SrangeBtn" type="button" onclick="return false;">'+
														'<a href="#parameterPopover" class="parameterButton">确认</a>'+
													'</button>'+
													'<button class="mui-btn mui-btn-success" id="CrangeBtn" type="button" onclick="return false;">'+
														'<a href="#parameterPopover" class="parameterButton">取消</a>'+
													'</button>'+
												'</div>';
			//mui初始化input
			mui('.mui-input-row input').input(); 
			//使输入框获得焦点
			document.getElementById("range0-input").focus();
			if(!radioDisabled && index>0){
				var rangeList = document.querySelectorAll('#parameterPopover input[type="range"]');
				if(oldselectedDevice!=null){
					var editParameterNodes = oldselectedDevice.parentNode.querySelectorAll('.parameter');	 
				    for(var i=0,len=editParameterNodes.length; i<len; i++){
				    	for(var j=0,rangeLen=rangeList.length; j<rangeLen; j++){
				    		if(rangeList[j].parentNode.dataset.title == editParameterNodes[i].dataset.title){
				    			rangeList[j].value = editParameterNodes[i].dataset.value;
				    			//当触发源为可燃气体感应器时标签为span，不支持大小于互换
				    			var CompareSymbolsNode = rangeList[j].parentNode.querySelector('button.CompareSymbols');
				    			if(CompareSymbolsNode!=null){
				    				if(editParameterNodes[i].dataset.CompareSymbols=="<"){
					    				CompareSymbolsNode.className = "mui-icon mui-icon-arrowleft CompareSymbols";
					    			}else{
					    				CompareSymbolsNode.className = "mui-icon mui-icon-arrowright CompareSymbols";
					    			}
				    			}
				    		}
				    	}
					}
				}
			    $('#parameterPopover').popover('show');
			    //将滑块input[type="range"]的值赋给输入框input[type="number"]
			    for(var i=0,len=rangeList.length;i<len;i++){
			    	document.getElementById(rangeList[i].id+"-input").value = rangeList[i].value;
			        rangeList[i].addEventListener('input',function(){
			            document.getElementById(this.id+"-input").value = this.value;
			        });
			    }
			    //对输入框input[type="number"]的值进行操作并赋给滑块input[type="range"]
			    var numberList = document.querySelectorAll('#parameterPopover input[type="text"]');
			    function keydownFn(e) {
	                if(e.which===13){
	                    e.preventDefault();
	                }
	            }
	            //对输入框input[type="number"]的值进行操作并赋给滑块input[type="range"]
			    for(var i=0,len=numberList.length;i<len;i++){
			    	numberList[i].addEventListener('keydown', keydownFn);
			        numberList[i].addEventListener('input',function(){
			        	if(this.value == ""){
			    			return;
			    		}
			    		var re = "";
			        	//匹配非数字字符串
			        	if(this.parentNode.innerText.indexOf("湿度")>=0){
			        		re = /^(\d+\.?\d?)$/;
			        	}else if(this.parentNode.innerText.indexOf("温度")>=0){
			        		re = /^(-|\+)?\d+(\.\d+)?$/;
			        	}else{
			        		re=/^\d+$/;
			        	} 
	   					if(!re.test(this.value)){
	   						//过滤非数字字符（负号也过滤），num为纯数字
	   						var num = this.value.replace(/[^\d^\.]+/gi,"").split(/[^0-9]/gi).join("");
	   						//判断原字符首位为负号"-"，则在前面添加"-"
	   						if(this.value.indexOf("-")==0 && this.parentNode.innerText.indexOf("温度")>=0){
	   							num = "-"+num;
	   						}
	   						this.value = num;
	   					}
	   					
			        	//var index = this.id.replace("-input","").replace("range","");
			        	var minNum = parseFloat(this.parentNode.dataset.min);
			    		var maxNum = parseFloat(this.parentNode.dataset.max);
			    		//当左边出现多个0时去除无效的0
			    		if(this.value != "0"){
			        		this.value = this.value.replace(/\b(0+)/gi,"");
			    		}		    		
			    		//判断input值是否在指定范围内，大于maxNum则置maxNum，小于minNum则置minNum
			        	if(this.value>maxNum){
			        		this.value = maxNum;	
			        	}
			        	document.getElementById(this.id.replace("-input","")).value = this.value;	
			        });
			        //失去焦点时将值置默认值defaultValue
			        numberList[i].addEventListener('blur',function(){
			        	//var index = this.id.replace("-input","").replace("range","");
			        	var minNum = parseInt(this.parentNode.dataset.min);
			    		var maxNum = parseInt(this.parentNode.dataset.max);
			        	if(this.value==""){
			        		this.value = this.dataset.defaultValue;
			        	}
			    		if(this.value<minNum){
			    			this.value = minNum;
			    		}
			    		if(this.value.endsWith(".")){
			    			this.value = this.value.substr(0,this.value.length-1);
			    		}
			        	document.getElementById(this.id.replace("-input","")).value = this.value;	
			        });
			    }
				document.querySelector('.mui-backdrop').parentNode.removeChild(document.querySelector('.mui-backdrop'));
		        document.querySelector('.Cmui-popup-backdrop').style.display="block";               
		        document.querySelector('.Cmui-popup-backdrop').classList.add('mui-active');
		        if (document.querySelector('.Cmui-popup-bckdrop.mui-active')) {
		            document.querySelector('.Cmui-popup-backdrop.mui-active').addEventListener('tap',function(){                   
		                this.classList.remove('mui-active');
		                this.style.display="";
		                if(oldselectedDevice==null){
							checkedDevice.checked = false;
						}else{
							checkedDevice.checked = false;
							oldselectedDevice.checked = true;
						}
		                $('#parameterPopover').popover('hide');
		            })        
		        }
			}else{
				//当选中新的带有参数的设备后将旧的设备参数信息移除。checkedDevice.checked是为了排除不可选设备的干扰
				if(oldselectedDevice!=null && oldselectedDevice.parentNode.parentNode.dataset.iddevice!=checkedDevice.parentNode.parentNode.dataset.iddevice && checkedDevice.checked){
			    	for(var i=0,len=parameterNodes.length; i<len; i++){
						parameterNodes[i].parentNode.removeChild(parameterNodes[i]);
					}
			    }
			}
			document.getElementById('slider').style.height=document.getElementById('privacy').querySelector(".mui-scroll").offsetHeight+'px';	
		}
	});
	//参数选择框的确定事件
	$('#parameterPopover').on('tap','#SrangeBtn', function (e) {
    	var labelNodeChild = document.querySelector("input[name='radio1']:checked").parentNode.querySelector('h5.mui-ellipsis');
    	var labelNode = labelNodeChild.parentNode;
    	labelNode.innerHTML = "";
    	labelNode.appendChild(labelNodeChild);
    	document.querySelector("input[type='text']").blur();
    	var rangeList = document.querySelectorAll('#parameterPopover input[type="range"]');
    	//将选择的参数写入设备类型下
	    for(var i=0,len=rangeList.length;i<len;i++){
	    	if(rangeList[i].parentNode.hidden == true){
	    		continue;
	    	}
	    	var index = rangeList[i].id.replace("range","");
	    	var h5Node = document.createElement("h5");
	    	h5Node.className = "parameter";
	    	h5Node.dataset.title = rangeList[i].parentNode.dataset.title;
	    	h5Node.dataset.value = rangeList[i].value;
	    	h5Node.dataset.unit = rangeList[i].parentNode.dataset.unit;
	    	h5Node.dataset.name = rangeList[i].parentNode.dataset.name;
	    	var CompareSymbols="&lt;";
	    	if(rangeList[i].parentNode.querySelector('.CompareSymbols').className.indexOf("left")<0){
	    		CompareSymbols = "&gt;";
	    	}
	    	h5Node.dataset.CompareSymbols = CompareSymbols;
	    	var stateNode = document.getElementById("state");
	    	if(stateNode!=undefined){
	    		labelNodeChild.dataset.state = stateNode.innerHTML;
	    	}
	    	h5Node.innerHTML = rangeList[i].parentNode.dataset.title+' : '+CompareSymbols+' '+rangeList[i].value+' '+rangeList[i].parentNode.dataset.unit;
	    	labelNode.appendChild(h5Node);
	    }
	    if(oldselectedDevice!=null && oldselectedDevice.parentNode.parentNode.dataset.iddevice!=checkedDevice.parentNode.parentNode.dataset.iddevice){
	    	for(var i=0,len=parameterNodes.length; i<len; i++){
				parameterNodes[i].parentNode.removeChild(parameterNodes[i]);
			}
	    }
	    
	    document.getElementById('slider').style.height=document.getElementById('privacy').querySelector(".mui-scroll").offsetHeight+'px';
	 	document.querySelector('.Cmui-popup-backdrop.mui-active').style.display=""; 
	});
	//参数选择框的取消事件
	$('#parameterPopover').on('tap','#CrangeBtn', function (e) {
		document.querySelector("input[type='text']").blur();
		if(oldselectedDevice==null){
			checkedDevice.checked = false;
		}else{
			checkedDevice.checked = false;
			oldselectedDevice.checked = true;
		}
		document.getElementById('slider').style.height=document.getElementById('privacy').querySelector(".mui-scroll").offsetHeight+'px';
	 	document.querySelector('.Cmui-popup-backdrop.mui-active').style.display=""; 
	});
	//参数选择框的大于(小于)按钮点击事件，实现大于小于的切换
	$('#parameterPopover').on('tap','button.CompareSymbols', function (e) {
		//禁止默认行为
    	e.preventDefault();
		if(e.target.className == "mui-icon mui-icon-arrowleft CompareSymbols"){
			e.target.className = "mui-icon mui-icon-arrowright CompareSymbols";
		}else{
			e.target.className = "mui-icon mui-icon-arrowleft CompareSymbols";
		}
	});
	//参数选择框的提示信息
	$('#parameterPopover').on('tap','.mui-icon.mui-icon-help', function (e) {
		 mui.toast('说明：感应器只支持大于条件下触发<br/>建议：设置值为'+e.target.dataset.defaultValue,{ duration:'3000', type:'div' })
	});
})(mui);