// 创建本地保存链接标签
fn.createLocalDownloadLink = function(){
	this.localDownloadLink = $('<a class="vschess-local-download-link"></a>').appendTo(this.DOM);
	return this;
};

// 本地保存
fn.localDownload = function(filename, filedata, param){
	if (!vs.localDownload) {
		return this;
	}

	param = $.extend({ type: "text/plain" }, param);
	var blob = new Blob([filedata], param);
	this.localDownloadLink.attr({ download: filename, href: URL.createObjectURL(blob) }).trigger("click");
	return this;
};
