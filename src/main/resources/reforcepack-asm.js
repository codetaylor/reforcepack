/**
 * This function is called by Forge before any minecraft classes are loaded to
 * setup the coremod.
 *
 * @return {object} All the transformers of this coremod.
 * @see https://github.com/Cadiboo/NoCubes/blob/1.14.x/src/main/resources/nocubes-transformer.js
 * @see https://cadiboo.github.io/tutorials/1.14.4/forge/99.99-coremod/
 */
function initializeCoreMod() {
  /*Class/Interface*/ Opcodes = Java.type("org.objectweb.asm.Opcodes");
  /*Class*/ ASMAPI = Java.type("net.minecraftforge.coremod.api.ASMAPI");

  /*Class*/ InsnList = Java.type("org.objectweb.asm.tree.InsnList");

  /*Class*/ AbstractInsnNode = Java.type("org.objectweb.asm.tree.AbstractInsnNode");
  /*Class*/ InsnNode = Java.type("org.objectweb.asm.tree.InsnNode");
  /*Class*/ VarInsnNode = Java.type("org.objectweb.asm.tree.VarInsnNode");
  /*Class*/ MethodInsnNode = Java.type("org.objectweb.asm.tree.MethodInsnNode");

  LABEL = AbstractInsnNode.LABEL;

  return {
    "Minecraft#reloadResources": {
      target: {
				/*
        MC 1.14.4: net/minecraft/client/Minecraft.reloadResources
        Name: g => func_213237_g => reloadResources
        Comment: None
        Side: CLIENT
        AT: public net.minecraft.client.Minecraft func_213237_g()Ljava/util/concurrent/CompletableFuture; # reloadResources
				*/
        type: "METHOD",
        class: "net.minecraft.client.Minecraft",
        methodName: "func_213237_g",
        methodDesc: "()Ljava/util/concurrent/CompletableFuture;"
      },
      transformer: function (methodNode) {
        inject(methodNode.instructions);
        return methodNode;
      }
    },
    "Minecraft#init": {
      target: {
        /*
        MC 1.14.4: net/minecraft/client/Minecraft.init
        Name: au => func_71384_a => init
        Comment: None
        Side: CLIENT
        AT: public net.minecraft.client.Minecraft func_71384_a()V # init
        */
        type: "METHOD",
        class: "net.minecraft.client.Minecraft",
        methodName: "func_71384_a",
        methodDesc: "()V"
      },
      transformer: function (methodNode) {
        injectInit(methodNode.instructions);
        return methodNode;
      }
    }
  };
}

// 1) Find INVOKEINTERFACE net/minecraft/resources/IReloadableResourceManager.reloadResources (Ljava/util/concurrent/Executor;Ljava/util/concurrent/Executor;Ljava/util/concurrent/CompletableFuture;Ljava/util/List;)Lnet/minecraft/resources/IAsyncReloader; (itf)
// 2) Find the first label before
// 3) Inject after the label

// Java
/*

  List<IResourcePack> list = this.resourcePackRepository.getEnabledPacks().stream().map(ResourcePackInfo::getResourcePack).collect(Collectors.toList());
	// ********************************************************** BEGIN **********************************************************
	com.codetaylor.mc.reforcepack.ReforcePackMod#onMinecraft$reloadResources(list1);
	// **********************************************************  END  **********************************************************
  this.setLoadingGui(new ResourceLoadProgressGui(this, this.resourceManager.reloadResources(Util.getServerExecutor(), this, field_223714_G, list), () -> {
     this.languageManager.parseLanguageMetadata(list);
     if (this.worldRenderer != null) {
        this.worldRenderer.loadRenderers();
     }

     completablefuture.complete((Void)null);
  }, true));

*/

// Bytecode
/*

L8
	// ********************************************************** BEGIN **********************************************************
	ALOAD 2
	INVOKESTATIC com/codetaylor/mc/reforcepack/ReforcePackMod.onMinecraft$reloadResources (Ljava/util/List;)V
	// **********************************************************  END  **********************************************************
  LINENUMBER 682 L8
  ALOAD 0
  NEW net/minecraft/client/gui/ResourceLoadProgressGui
  DUP
  ALOAD 0
  ALOAD 0
  GETFIELD net/minecraft/client/Minecraft.resourceManager : Lnet/minecraft/resources/IReloadableResourceManager;
  INVOKESTATIC net/minecraft/util/Util.getServerExecutor ()Ljava/util/concurrent/Executor;
  ALOAD 0
  GETSTATIC net/minecraft/client/Minecraft.field_223714_G : Ljava/util/concurrent/CompletableFuture;
  ALOAD 2
  INVOKEINTERFACE net/minecraft/resources/IReloadableResourceManager.reloadResources (Ljava/util/concurrent/Executor;Ljava/util/concurrent/Executor;Ljava/util/concurrent/CompletableFuture;Ljava/util/List;)Lnet/minecraft/resources/IAsyncReloader; (itf)
  ALOAD 0
  ALOAD 2
  ALOAD 1
  INVOKEDYNAMIC run(Lnet/minecraft/client/Minecraft;Ljava/util/List;Ljava/util/concurrent/CompletableFuture;)Ljava/lang/Runnable; [
    // handle kind 0x6 : INVOKESTATIC
    java/lang/invoke/LambdaMetafactory.metafactory(Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodHandle;Ljava/lang/invoke/MethodType;)Ljava/lang/invoke/CallSite;
    // arguments:
    ()V, 
    // handle kind 0x7 : INVOKESPECIAL
    net/minecraft/client/Minecraft.lambda$reloadResources$16(Ljava/util/List;Ljava/util/concurrent/CompletableFuture;)V, 
    ()V
  ]
  ICONST_1
  INVOKESPECIAL net/minecraft/client/gui/ResourceLoadProgressGui.<init> (Lnet/minecraft/client/Minecraft;Lnet/minecraft/resources/IAsyncReloader;Ljava/lang/Runnable;Z)V
  INVOKEVIRTUAL net/minecraft/client/Minecraft.setLoadingGui (Lnet/minecraft/client/gui/LoadingGui;)V

*/

/*
MC 1.14.4: net/minecraft/resources/IReloadableResourceManager.reloadResources
Name: a => func_219537_a => reloadResources
Comment: None
Side: CLIENT
AT: public net.minecraft.resources.IReloadableResourceManager func_219537_a(Ljava/util/concurrent/Executor;Ljava/util/concurrent/Executor;Ljava/util/concurrent/CompletableFuture;Ljava/util/List;)Lnet/minecraft/resources/IAsyncReloader; # reloadResources
*/

function inject(instructions) {

  var reloadResources_name = ASMAPI.mapMethod("func_219537_a"); // IReloadableResourceManager.reloadResources
  var first_INVOKEINTERFACE_reloadResources;
	var arrayLength = instructions.size();
	
  for (var i = 0; i < arrayLength; ++i) {
    var instruction = instructions.get(i);
    if (instruction.getOpcode() == Opcodes.INVOKEINTERFACE) {
      if (instruction.owner == "net/minecraft/resources/IReloadableResourceManager") {
        if (instruction.name == reloadResources_name) {
          if (instruction.desc == "(Ljava/util/concurrent/Executor;Ljava/util/concurrent/Executor;Ljava/util/concurrent/CompletableFuture;Ljava/util/List;)Lnet/minecraft/resources/IAsyncReloader;") {
            if (instruction.itf == true) {
              first_INVOKEINTERFACE_reloadResources = instruction;
              print('Found injection point "IReloadableResourceManager.reloadResources" ' + instruction);
              break;
            }
          }
        }
      }
    }
	}
	
	if (!first_INVOKEINTERFACE_reloadResources) {
		throw "Error: Couldn't find injection point \"IReloadableResourceManager.reloadResources\"! " + instructions;
	}

	var firstLabelBefore_first_INVOKEINTERFACE_reloadResources;
	for (i = instructions.indexOf(first_INVOKEINTERFACE_reloadResources); i >= 0; --i) {
		var instruction = instructions.get(i);
		if (instruction.getType() == LABEL) {
			firstLabelBefore_first_INVOKEINTERFACE_reloadResources = instruction;
			print("Found label \"firstLabelBefore_first_INVOKEINTERFACE_reloadResources\" " + instruction);
			break;
		}
	}

	if (!firstLabelBefore_first_INVOKEINTERFACE_reloadResources) {
		throw "Error: Couldn't find label \"firstLabelBefore_first_INVOKEINTERFACE_reloadResources\"!";
	}

	var toInject = new InsnList();

	toInject.add(new VarInsnNode(Opcodes.ALOAD, 2)); // list1
	toInject.add(new MethodInsnNode(
		//int opcode
		Opcodes.INVOKESTATIC,
		//String owner
		"com/codetaylor/mc/reforcepack/ReforcePackMod",
		//String name
		"onMinecraft$reloadResources",
		//String descriptor
		"(Ljava/util/List;)V",
		//boolean isInterface
		false
	));

	instructions.insert(firstLabelBefore_first_INVOKEINTERFACE_reloadResources, toInject);
}

// 1) Find INVOKEINTERFACE java/util/List.iterator ()Ljava/util/Iterator; (itf)
// 2) Find the first label before
// 3) Inject after the label

/*

  List<IResourcePack> list = this.resourcePackRepository.getEnabledPacks().stream().map(ResourcePackInfo::getResourcePack).collect(Collectors.toList());
  // ********************************************************** BEGIN **********************************************************
  com.codetaylor.mc.reforcepack.ReforcePackMod#onMinecraft$init(list);
  // **********************************************************  END  **********************************************************
  for(IResourcePack iresourcepack : list) {
     this.resourceManager.addResourcePack(iresourcepack);
  }

*/

/*

L33
	// ********************************************************** BEGIN **********************************************************
	ALOAD 3
	INVOKESTATIC com/codetaylor/mc/reforcepack/ReforcePackMod.onMinecraft$init (Ljava/util/List;)V
	// **********************************************************  END  **********************************************************
  LINENUMBER 458 L33
  ALOAD 3
  INVOKEINTERFACE java/util/List.iterator ()Ljava/util/Iterator; (itf)
  ASTORE 4

*/

function injectInit(instructions) {

  var first_INVOKEINTERFACE_iterator;
	var arrayLength = instructions.size();
	
  for (var i = 0; i < arrayLength; ++i) {
    var instruction = instructions.get(i);
    if (instruction.getOpcode() == Opcodes.INVOKEINTERFACE) {
      if (instruction.owner == "java/util/List") {
        if (instruction.name == "iterator") {
          if (instruction.desc == "()Ljava/util/Iterator;") {
            if (instruction.itf == true) {
              first_INVOKEINTERFACE_iterator = instruction;
              print('Found injection point "List.iterator" ' + instruction);
              break;
            }
          }
        }
      }
    }
	}
	
	if (!first_INVOKEINTERFACE_iterator) {
		throw "Error: Couldn't find injection point \"List.iterator\"! " + instructions;
	}

	var firstLabelBefore_first_INVOKEINTERFACE_iterator;
	for (i = instructions.indexOf(first_INVOKEINTERFACE_iterator); i >= 0; --i) {
		var instruction = instructions.get(i);
		if (instruction.getType() == LABEL) {
			firstLabelBefore_first_INVOKEINTERFACE_iterator = instruction;
			print("Found label \"firstLabelBefore_first_INVOKEINTERFACE_iterator\" " + instruction);
			break;
		}
	}

	if (!firstLabelBefore_first_INVOKEINTERFACE_iterator) {
		throw "Error: Couldn't find label \"firstLabelBefore_first_INVOKEINTERFACE_iterator\"!";
	}

	var toInject = new InsnList();

	toInject.add(new VarInsnNode(Opcodes.ALOAD, 3)); // list
	toInject.add(new MethodInsnNode(
		//int opcode
		Opcodes.INVOKESTATIC,
		//String owner
		"com/codetaylor/mc/reforcepack/ReforcePackMod",
		//String name
		"onMinecraft$init",
		//String descriptor
		"(Ljava/util/List;)V",
		//boolean isInterface
		false
	));

	instructions.insert(firstLabelBefore_first_INVOKEINTERFACE_iterator, toInject);
}
