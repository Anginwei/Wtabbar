;
(function($) {
	var methods = {
		init: function(option) {
			var opt = $.extend({}, {
				activeClass: "active", // 处于激活状态标签的类名
				curItem: 0, // 当前标签的索引位置
				referName: "data-refer", // 多个实例中，关联内容块与标签栏的属性名
				blockName: "data-name", // 区别不同标签内容的属性名
				switchMode: "click" // 标签切换模式，"click"或"mouseover"
			}, option);
			return this.each(function(i, elem) {
				// elem为ul
				var $this = $(elem),
					name = opt.referName,
					value = $this.attr(name),
					curObj;
				if (!$this.data("activeClass")) {
					// 写入配置 + 状态数据
					$this.data($.extend({}, opt, {
						tabList: $("li", elem).toArray(), // 标签列表
						contentList: $("div[" + name + "=" + value + "]>div").toArray() // 与之关联的内容块列表
					}));
					// 设定初始显示状态
					curObj = $($this.data("tabList")[$this.data("curItem")]);
					curObj.addClass($this.data("activeClass"));
					$($this.data("contentList")).hide().each(function(i, elem) {
						var $elem = $(elem);
						if ($elem.attr($this.data("blockName")) == curObj.text().trim()) {
							$elem.show();
							return;
						}
					});
					// 绑定事件
					$this.bind($this.data("switchMode"), function(event) {
						var target = event.target;
						if (target.nodeName.toLowerCase() == "li") {
							methods.switchTab.call(this, target);
						}
					});
				}
			});
		},
		/*
		 * create,remove两个方法可以从外部调用，传入需要删除或添加的标签名
		 * 如果remove删除的是当前的激活标签，则删除后会隐藏改标签内容块，不移除
		 */
		create: function(name) {
			if (typeof name == "string") {
				return this.each(function(i, elem) {
					var $this = $(elem);
					if (!methods.hasTab.call($this.data("tabList"), name)) {
						$this.append("<li>" + name + "</li>");
						methods.update.call(elem);
					}
				});
			} else {
				throw new Error("Wtabbar.create参数类型有误");
			}
		},
		remove: function(name) {
		    if (typeof name == "string") {
		    	return this.each(function (i, elem) {
		    		var $this = $(elem),
		    		    tlist = $this.data("tabList"),
		    		    clist = $this.data("contentList"),
		    		    curItem = $this.data("curItem");
		    		if (methods.hasTab.call($this.data("tabList"), name)) {
		    		    // 遍历列表
                        tlist.forEach(function (item, i) {
                            if (item.innerHTML.indexOf(name) != -1) {
                                elem.removeChild(item);
                                // 要删除的标签为当前激活标签，则移除后要隐藏内容
                                if (curItem == i) {
                                    clist[i].style.display = "none";
                                }
                            }
        		    	    methods.update.call(elem);
                        });
		    		}
		    	});
		    } else {
		        throw new Error("Wtabbar.remove参数类型有误");
		    }
		},
		/*
		 * 内部方法，以下方法仅仅操作一个元素
		 */
		// 更新标签列表
		update: function() {
			$(this).data("tabList", $("li", this).toArray());
		},
		// 切换标签
		switchTab: function(target) {
			var targetIndex, // 目标元素位于列表中的位置
				$this = $(this),
				tabList = $this.data("tabList"),
				contentList = $this.data("contentList"),
				cur = $this.data("curItem");
			// 确定targetIndex
			tabList.forEach(function(elem, i) {
				if (elem.isSameNode(target)) {
					targetIndex = i;
				}
			});
			if (cur != targetIndex) {
				// 切换标签
				$(tabList[cur]).toggleClass("active");
				$this.data("curItem", targetIndex);
				$(tabList[targetIndex]).toggleClass("active");
				// 切换内容
				$(contentList).hide().each(function(i, elem) {
					var $elem = $(elem);
					if ($elem.attr($this.data("blockName")) == $(target).text().trim()) {
						$elem.show();
						return;
					}
				});
			}
		},
		// this=tabList[]
		hasTab: function(name) {
			var flag = false;
			this.forEach(function(elem) {
				if ($(elem).text().trim() == name) {
					flag = true;
					return;
				}
			});
			return flag;
		}
	}; //end of object methods
	$.fn.extend({
		/*
		 * 若传入方法名，则调用该方法，后面要跟方法参数
		 * 若传入配置，则初始化插件
		 */
		Wtabbar: function(method) {
			if (this.length == 0) {
				throw new Error("未选中任何元素，请检查选择器");
			}
			if (typeof method == "string" && methods[method]) {
				return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
			} else if (typeof method == "object" || method === undefined) {
				return methods.init.call(this, method);
			} else {
				throw new Error("参数错误或方法不存在");
			}
		}
	});
})(jQuery);