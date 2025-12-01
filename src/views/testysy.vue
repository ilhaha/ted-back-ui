<!-- 视频监控 -->
<template>
    <div class="video">
        <div class="video-item">
            <div class="item">
                <div class="home" ref="viewtools">
                    <div id="video-container1"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import EZUIKit from "ezuikit-js";
let ezvizPlayOne = ref(null);
let ezvizPlayTwo = ref(null);
let viewtools = ref();
let viewtoolTwo = ref();
function autoVideoOne(params) {
    // 获取父节点的宽高
    let divW = viewtools.value.clientWidth
    let divH = viewtools.value.clientHeight
    if (ezvizPlayOne.value !== null) {
        return;
    }
    //获取萤石token
    ezvizPlayOne.value = new EZUIKit.EZUIKitPlayer({
        autoplay: true,  // 默认播放
        //视频播放包裹元素
        id: "video-container1",
        //萤石token
        accessToken: "at.8zeg58od2xst0rh74gyyxcsh1ima79dn-9kgmiia6kg-0t6bxph-w5ebk41qb",
        // ezopen://open.ys7.com/${设备序列号}/{通道号}.live
        url: "ezopen://open.ys7.com/780636888/1.live", // 播放地址

        template: "security", // simple - 极简版;standard-标准版;security - 安防版(预览回放);voice-语音版；
        // header: ['capturePicture', 'zoom'], // 如果templete参数不为simple,该字段将被覆盖
        plugin: ['talk'], // 加载插件，talk-对讲
        // 视频下方底部控件
        footer: ["talk", "broadcast", "hd", "fullScreen"], // 如果template参数不为simple,该字段将被覆盖
        footer: ['talk', 'hd', 'fullScreen'], // 如果template参数不为simple,该字段将被覆盖
        audio: 0, // 是否默认开启声音 0 - 关闭 1 - 开启
        // openSoundCallBack: data => console.log("开启声音回调", data),
        // closeSoundCallBack: data => console.log("关闭声音回调", data),
        // startSaveCallBack: data => console.log("开始录像回调", data),
        // stopSaveCallBack: data => console.log("录像回调", data),
        // capturePictureCallBack: data => console.log("截图成功回调", data),
        // fullScreenCallBack: data => console.log("全屏回调", data),
        // getOSDTimeCallBack: data => console.log("获取OSDTime回调", data),
        width: divW,
        height: divH
    })
}
function autoVideoTwo(params) {
    let divW = viewtoolTwo.value.clientWidth
    let divH = viewtoolTwo.value.clientHeight
    if (ezvizPlayTwo.value !== null) {
        return;
    }
}
onMounted(() => {
    autoVideoOne();
    autoVideoTwo();
})


</script>
<style lang="scss" scoped>
.video {
    width: 100%;
    height: 80%;

    .video-item {
        display: flex;
        padding: 1%;

        .item {
            flex: 1;
            height: 40vh;
            margin: 0 1%;

            .home {
                width: 100%;
                height: 100%;
            }

        }
    }
}
</style>
