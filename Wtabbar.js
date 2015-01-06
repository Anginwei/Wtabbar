/*
 * Wtabbar，简易标签栏jQuery插件
 * version: 1.1
 * github: https://github.com/Anginwei/Wtabbar
 * author: Anginwei
 * date: 2014.12.31
 */
;
(function($) {
	var methods = {
		init: function(option) {
			var opt = $.extend({}, {
				activeClass: "active", // 处于激活状态标签的类名
				referName: "data-refer", // 多个实例中，关联内容块与标签栏的属性名
				blockName: "data-name", // 每个标签与内容的映射属性名
				switchMode: "click", // 标签切换模式，"click"或"mouseover"
				switchAnim: null, // 切换时，标签动画函数，传入当前内容，目标内容，当前标签，目标标签
				animAuto: true, // 切换时，标签是否自动切换，深度定制切换效果请设置为false
				autoSwitch: 0 // 自动切换间隔，0为不自动切换，单位秒
			}, option);

			return this.each(function() {
				var $this = $(this), // this->ul
					data = $.extend({}, opt, {
						tabList: $("li", this).toArray(), // 标签列表
						curTab: $("li", this).get(0), // 当前标签
						contentList: $("div[" + opt.referName + "=" +
								$this.attr(opt.referName) + "]>div").toArray() // 与之关联的内容块列表
					});

				// 写入配置 + 状态数据
				$this.data("option", data);

				var tabList = data.tabList,
					contentList = data.contentList,
					activeClass = data.activeClass,
					blockName = data.blockName,
					switchMode = data.switchMode,
					$curTab = $(data.curTab),
					blockValue = $curTab.attr(blockName);

				// 设定初始显示状态
				$curTab.addClass(activeClass);
				$(contentList).hide().filter("[" + blockName + "=" + blockValue + "]").show();

				// 绑定事件
				$this.bind(switchMode, function(event) {
					if (event.target !== this) { // this->ul
						var target = $(event.target).closest("li", this).get(0);

						methods.switchTab.call($(this), target);
					}
				});

				// 设置自动切换
				if (data.autoSwitch > 0) {
					(function () {
						function autoSwitch() {
						    methods.switchTab.call($this, "next");
						    setTimeout(autoSwitch, data.autoSwitch*1000);
						}
						setTimeout(autoSwitch, data.autoSwitch*1000);
					})();
				}
			});
		},
		/* -----------------------------------------------------
		 * create,remove,switchTab可以从外部调用
		 */

		/*
		 * @param {String} newTab 新标签的html字符串
		 */
		create: function(newTab) {
			if (typeof newTab == "string") {
				return this.each(function() {
					var $this = $(this), // this->ul
						opt = $this.data("option"),
						blockValue = newTab.match(/".*"/)[0].replace(/"/g, "");

					// 不重复创建同名标签
					if (methods.hasTab(opt, blockValue) == -1) {
						$this.append(newTab);
						// 更新标签列表
						methods.changeOption($this, "tabList", $("li", this).toArray());
						methods.switchTab.call($this, opt.tabList[opt.tabList.length - 1]);
					}
				});
			} else {
				throw new Error("Wtabbar.create参数类型有误");
			}
		},

		/*
		 * @param {String} blockValue 要删除标签的关联属性值
		 */
		remove: function(blockValue) {
			if (typeof blockValue == "string") {
				return this.each(function() {
					var $this = $(this), // this->ul
						opt = $this.data("option"),
						targetIndex = methods.hasTab(opt, blockValue);

					// 目标标签存在才执行删除操作
					if (targetIndex != -1) {
						// 删除当前标签，先切换再移除
						if (opt.tabList[targetIndex] === opt.curTab) {
							opt.tabList.length ? methods.switchTab.call($this, opt.tabList[0]) :
								$(opt.contentList).filter("[" + opt.blockName + "=" + blockValue + "]").hide();
						}
						$(opt.tabList[targetIndex]).remove();
						// 更新标签列表
						methods.changeOption($this, "tabList", $("li", this).toArray());
					}
				});
			} else {
				throw new Error("Wtabbar.remove参数类型有误");
			}
		},
		/*
		 * @param {Element|String} target 目标li元素或"previous" || "next"
		 */
		switchTab: function(target) {
			return this.each(function() {
				var $this = $(this), // this->ul
					opt = $this.data("option");
				// 确定目标
				target =
					target === "previous" && methods.loopSearch(opt, "previous") ||
					target === "next" && methods.loopSearch(opt, "next") || target;
				if (target.nodeName.toLowerCase() !== "li") {
					throw new Error("Wtabbar.switchTab参数有误");
				}

				var $curTab = $(opt.curTab),
					$target = $(target),
					$curCon = $(opt.contentList).filter("[" + opt.blockName + "=" +
						$curTab.attr(opt.blockName) + "]"),
					$tarCon = $(opt.contentList).filter("[" + opt.blockName + "=" +
						$target.attr(opt.blockName) + "]"),
					animArg = [$curCon.get(0), $tarCon.get(0), opt.curTab, target];


				// 跳过点击当前已激活的标签
				if (opt.curTab !== target) {
					if (opt.animAuto) {
						$curTab.toggleClass(opt.activeClass);
						$target.toggleClass(opt.activeClass);
					}
					if (typeof opt.switchAnim === "function") {
						opt.switchAnim.apply(this, animArg);
					} else {
						$curCon.toggle();
						$tarCon.toggle();
					}
					// 修改位置
					methods.changeOption($this, "curTab", target);
				}
			});
		},
		/* -----------------------------------------------------
		 * 内部方法
		 */

		changeOption: function($this, name, value) {
			var opt = $this.data("option");
			opt[name] = value;
			$this.data("option", opt);
		},

		loopSearch: function(opt, dir) {
			var curIndex = $(opt.curTab).index(),
				target = null;

			dir === "previous" && curIndex-- ||
				dir === "next" && curIndex++;
			target = curIndex < 0 && opt.tabList[opt.tabList.length - 1] ||
				opt.tabList[curIndex % opt.tabList.length];
			return target;
		},

		hasTab: function(opt, name) {
			var index = -1;
			opt.tabList.forEach(function(li, i) {
				if ($(li).attr(opt.blockName) == name) {
					index = i;
					return;
				}
			});
			return index;
		}
	}; // object methods

	$.fn.extend({
		/*
		 * 若传入方法名，则调用该方法，后面要跟方法参数
		 * 若传入配置或留空参数，则初始化插件
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